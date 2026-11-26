import { describe, expect, it } from 'vitest';
import { act, render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { routes } from '../routes.jsx';

function renderGallery(url = '/gallery') {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const utils = render(<RouterProvider router={router} />);
  return { router, ...utils };
}

const search = (router) => router.state.location.search;
const getDialog = () => screen.getByRole('dialog', { hidden: true });
const photoLinks = () => within(screen.getByRole('list', { name: 'Photos' })).getAllByRole('link');

describe('GalleryPage — category filter deep link', () => {
  it('shows every photo when no category is set', async () => {
    renderGallery('/gallery');
    await screen.findByRole('heading', { level: 1, name: 'Photo gallery' });
    expect(photoLinks()).toHaveLength(12);
    expect(screen.getByRole('button', { name: /^All/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters from the URL on first load', async () => {
    renderGallery('/gallery?category=forensics');
    await screen.findByRole('heading', { level: 1 });
    expect(photoLinks()).toHaveLength(3);
    expect(screen.getByRole('button', { name: /^Forensics/ })).toHaveAttribute('aria-pressed', 'true');
  });

  it('writes the selected category to the URL and drops photoId', async () => {
    const user = userEvent.setup();
    const { router } = renderGallery('/gallery?ref=mail');
    await user.click(await screen.findByRole('button', { name: /^Documents/ }));
    expect(search(router)).toBe('?ref=mail&category=documents');
    expect(photoLinks()).toHaveLength(3);
  });

  it('announces an invalid category and falls back to all photos', async () => {
    renderGallery('/gallery?category=hacker');
    expect(await screen.findByRole('status')).toHaveTextContent('hacker');
    expect(photoLinks()).toHaveLength(12);
  });
});

describe('GalleryPage — <dialog> lightbox deep link', () => {
  it('opens the dialog directly from ?photoId', async () => {
    renderGallery('/gallery?category=forensics&photoId=ev-05');
    await screen.findByRole('heading', { level: 1 });
    const dialog = getDialog();
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByRole('heading', { name: 'Fabric fibre sample' })).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName('Fabric fibre sample');
  });

  it('opens a photo via its link while keeping the category', async () => {
    const user = userEvent.setup();
    const { router } = renderGallery('/gallery?category=scene');
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('link', { name: /Basement parking lot/ }));
    expect(search(router)).toBe('?category=scene&photoId=ev-03');
    expect(getDialog()).toHaveAttribute('open');
  });

  it('close button removes only photoId from the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderGallery('/gallery?category=scene&photoId=ev-02');
    await screen.findByRole('heading', { level: 1 });
    await user.click(within(getDialog()).getByRole('button', { name: 'Close photo' }));
    expect(search(router)).toBe('?category=scene');
    expect(getDialog()).not.toHaveAttribute('open');
  });

  it('native close (Esc) syncs back to the URL', async () => {
    const { router } = renderGallery('/gallery?photoId=ev-07');
    await screen.findByRole('heading', { level: 1 });
    act(() => getDialog().close()); // what the browser does on Esc
    expect(search(router)).toBe('');
  });

  it('shows an alert for an unknown photoId and keeps the dialog closed', async () => {
    renderGallery('/gallery?photoId=ev-404');
    expect(await screen.findByRole('alert')).toHaveTextContent('ev-404');
    expect(getDialog()).not.toHaveAttribute('open');
  });

  it('ArrowRight / ArrowLeft move inside the filtered list using history REPLACE', async () => {
    const { router } = renderGallery('/gallery?category=surveillance&photoId=ev-07');
    await screen.findByRole('heading', { level: 1 });
    fireEvent.keyDown(getDialog(), { key: 'ArrowRight' });
    expect(search(router)).toBe('?category=surveillance&photoId=ev-08');
    expect(router.state.historyAction).toBe('REPLACE');
    fireEvent.keyDown(getDialog(), { key: 'ArrowLeft' });
    expect(search(router)).toBe('?category=surveillance&photoId=ev-07');
  });

  it('disables "next" on the last photo of the filter', async () => {
    renderGallery('/gallery?category=surveillance&photoId=ev-09');
    await screen.findByRole('heading', { level: 1 });
    expect(within(getDialog()).getByRole('button', { name: 'Next photo' })).toBeDisabled();
    expect(within(getDialog()).getByText('3 / 3')).toBeInTheDocument();
  });

  it('browser Back closes the dialog without pushing a new history entry', async () => {
    const user = userEvent.setup();
    const { router } = renderGallery('/gallery?category=scene');
    await screen.findByRole('heading', { level: 1 });
    await user.click(screen.getByRole('link', { name: /Living room floor plan/ }));
    expect(getDialog()).toHaveAttribute('open');

    await act(() => router.navigate(-1));
    expect(search(router)).toBe('?category=scene');
    expect(router.state.historyAction).toBe('POP'); // no extra PUSH from onClose
    expect(getDialog()).not.toHaveAttribute('open');
  });
});


describe('GalleryPage — focus management (WCAG 2.4.3)', () => {
  it('returns focus to the card of the last viewed photo after closing', async () => {
    const user = userEvent.setup();
    renderGallery('/gallery?category=documents&photoId=ev-10');
    await screen.findByRole('heading', { level: 1 });
    fireEvent.keyDown(getDialog(), { key: 'ArrowRight' }); // now on ev-11
    await user.click(within(getDialog()).getByRole('button', { name: 'Close photo' }));
    expect(document.activeElement).toHaveAttribute('data-photo-id', 'ev-11');
  });
});