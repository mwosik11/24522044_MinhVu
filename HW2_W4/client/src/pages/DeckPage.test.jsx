import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { routes } from '../routes.jsx';

const PROFILES = [
  { slug: 'alice', name: 'Alice', age: 25, city: 'Hanoi', bio: 'Bio A', greenFlags: ['Kind'], redFlags: [], order: 1 },
  { slug: 'bao', name: 'Bao', age: 27, city: 'Hue', bio: 'Bio B', greenFlags: [], redFlags: ['Late'], order: 2 },
  { slug: 'chi', name: 'Chi', age: 23, city: 'Da Nang', bio: 'Bio C', greenFlags: [], redFlags: [], order: 3 },
];

const json = (status, data) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

/** In-memory stand-in for the Express API, installed as global fetch. */
function installFakeApi({ savedSwipes = [], failProfilesOnce = false, failPost = false, holdPosts = false } = {}) {
  const calls = [];
  const heldPosts = [];
  let profileFailures = failProfilesOnce ? 1 : 0;

  const fetchMock = vi.fn(async (url, init = {}) => {
    const method = init.method ?? 'GET';
    const body = init.body ? JSON.parse(init.body) : undefined;
    calls.push({ method, url, body });

    if (url === '/api/profiles') {
      if (profileFailures > 0) {
        profileFailures -= 1;
        return json(500, { error: 'DB down' });
      }
      return json(200, PROFILES);
    }
    if (url.startsWith('/api/swipes')) return json(200, savedSwipes);
    if (method === 'POST') {
      if (failPost) return json(500, { error: 'DB down' });
      if (holdPosts) return new Promise((resolve) => heldPosts.push(() => resolve(json(201, body))));
      return json(201, body);
    }
    if (method === 'DELETE') return new Response(null, { status: 204 });
    return json(404, { error: 'not found' });
  });

  vi.stubGlobal('fetch', fetchMock);
  return {
    posts: () => calls.filter((c) => c.method === 'POST'),
    deletes: () => calls.filter((c) => c.method === 'DELETE'),
    releasePosts: () => heldPosts.splice(0).forEach((release) => release()),
  };
}

function renderApp(url = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(<RouterProvider router={router} />);
  return router;
}

const findCard = (name) => screen.findByRole('heading', { name: new RegExp(`^${name},`) });
const getCard = (name) => screen.getByRole('heading', { name: new RegExp(`^${name},`) });
const press = (key, init = {}) => fireEvent.keyDown(window, { key, ...init });
const expectScore = (n) => expect(screen.getByTestId('score').textContent).toBe(String(n));

describe('loading', () => {
  it('shows the first profile with a score of 0 and Undo disabled', async () => {
    installFakeApi();
    renderApp();
    expect(await findCard('Alice')).toBeInTheDocument();
    expectScore(0);
    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  it('shows an alert with Retry when profiles fail to load', async () => {
    const user = userEvent.setup();
    installFakeApi({ failProfilesOnce: true });
    renderApp();
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load profiles: DB down');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await findCard('Alice')).toBeInTheDocument();
  });
});

describe('keyboard', () => {
  it('ArrowRight likes (+10), saves to the API and announces it', async () => {
    const api = installFakeApi();
    renderApp();
    await findCard('Alice');

    press('ArrowRight');
    expect(await findCard('Bao')).toBeInTheDocument();
    expectScore(10);
    expect(screen.getByRole('status')).toHaveTextContent('Liked Alice (+10).');
    await waitFor(() => expect(api.posts()).toHaveLength(1));
    expect(api.posts()[0].body).toMatchObject({ profileSlug: 'alice', action: 'LIKE' });
    expect(api.posts()[0].body.sessionId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('ArrowLeft (NOPE) and ArrowUp (FRIENDZONE) cost 5 points each', async () => {
    installFakeApi();
    renderApp();
    await findCard('Alice');

    press('ArrowLeft');
    await findCard('Bao');
    press('ArrowUp');
    await findCard('Chi');
    expectScore(-10);
  });

  it('ignores auto-repeated key presses', async () => {
    const api = installFakeApi();
    renderApp();
    await findCard('Alice');

    press('ArrowRight', { repeat: true });
    expect(getCard('Alice')).toBeInTheDocument();
    expectScore(0);
    expect(api.posts()).toHaveLength(0);
  });

  it('Backspace undoes in LIFO order and deletes each swipe on the server', async () => {
    const api = installFakeApi();
    renderApp();
    await findCard('Alice');

    press('ArrowRight');
    await findCard('Bao');
    press('ArrowLeft');
    await findCard('Chi');
    expectScore(5);

    press('Backspace');
    expect(await findCard('Bao')).toBeInTheDocument();
    expectScore(10);
    press('Backspace');
    expect(await findCard('Alice')).toBeInTheDocument();
    expectScore(0);

    await waitFor(() => expect(api.deletes()).toHaveLength(2));
    for (const post of api.posts()) {
      expect(api.deletes().some((d) => d.url.includes(post.body.clientId))).toBe(true);
    }
  });
});

describe('buttons and pointer', () => {
  it('buttons mirror the keyboard', async () => {
    const user = userEvent.setup();
    installFakeApi();
    renderApp();
    await findCard('Alice');

    await user.click(screen.getByRole('button', { name: 'Like' }));
    await findCard('Bao');
    await user.click(screen.getByRole('button', { name: 'Friendzone' }));
    await findCard('Chi');
    expectScore(5);

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(await findCard('Bao')).toBeInTheDocument();
    expectScore(10);
  });

  it('a short drag snaps back; a drag past the threshold likes', async () => {
    const api = installFakeApi();
    renderApp();
    await findCard('Alice');
    const card = screen.getByTestId('profile-card');

    fireEvent.pointerDown(card, { clientX: 100, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(card, { clientX: 140, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: 140, clientY: 100, pointerId: 1 });
    expect(getCard('Alice')).toBeInTheDocument();
    expect(api.posts()).toHaveLength(0);

    fireEvent.pointerDown(card, { clientX: 100, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(card, { clientX: 260, clientY: 110, pointerId: 1 });
    fireEvent.pointerUp(card, { clientX: 260, clientY: 110, pointerId: 1 });
    expect(await findCard('Bao')).toBeInTheDocument();
    expectScore(10);
  });
});

describe('persistence', () => {
  it('rolls the card back with an alert when the POST fails', async () => {
    installFakeApi({ failPost: true });
    renderApp();
    await findCard('Alice');

    press('ArrowRight');
    expect(await screen.findByRole('alert')).toHaveTextContent('Swipe on Alice was not saved: DB down');
    expect(getCard('Alice')).toBeInTheDocument();
    expectScore(0);
  });

  it('undo waits for the in-flight POST before sending DELETE (race guard)', async () => {
    const api = installFakeApi({ holdPosts: true });
    renderApp();
    await findCard('Alice');

    press('ArrowRight');
    await findCard('Bao');
    press('Backspace');
    await findCard('Alice');

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(api.deletes()).toHaveLength(0); // POST not finished → DELETE must wait

    await act(async () => api.releasePosts());
    await waitFor(() => expect(api.deletes()).toHaveLength(1));
    expect(api.deletes()[0].url).toContain(api.posts()[0].body.clientId);
  });

  it('restores progress saved on the server', async () => {
    installFakeApi({
      savedSwipes: [{ clientId: '00000000-0000-4000-8000-000000000001', profileSlug: 'alice', action: 'LIKE' }],
    });
    renderApp();
    expect(await findCard('Bao')).toBeInTheDocument();
    expectScore(10);
  });
});

describe('matches route', () => {
  it('lists liked and friendzoned profiles and disables deck shortcuts', async () => {
    const user = userEvent.setup();
    installFakeApi();
    renderApp();
    await findCard('Alice');

    press('ArrowRight');
    await findCard('Bao');
    press('ArrowUp');
    await findCard('Chi');

    await user.click(screen.getByRole('link', { name: /Matches/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Your matches' })).toBeInTheDocument();
    const liked = screen.getByRole('list', { name: 'Liked profiles' });
    expect(within(liked).getByText(/Alice/)).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Friendzoned profiles' })).getByText(/Bao/)).toBeInTheDocument();

    press('Backspace'); // keyboard listener is unmounted with the deck page
    expect(within(liked).getByText(/Alice/)).toBeInTheDocument();
  });
});