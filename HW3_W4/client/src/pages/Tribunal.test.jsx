import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { routes } from '../routes.jsx';
import { computeMatrix } from '../../../shared/matrix.js';
import { validateAppeal } from '../../../shared/appealRules.js';

const HOUR = 60 * 60 * 1000;
const iso = (ms) => new Date(ms).toISOString();

const PLAYERS = [
  { playerId: 'himass', handle: 'Himass', team: 'S3T Phoenix' },
  { playerId: 'tanvuu', handle: 'TanVuu', team: 'S3T Phoenix' },
];

function buildDossiers({ expired = [] } = {}) {
  const now = Date.now();
  const deadline = (id, ms) => iso(expired.includes(id) ? now - 1000 : now + ms);
  return {
    himass: {
      player: { playerId: 'himass', handle: 'Himass', realName: 'Hi Mass', team: 'S3T Phoenix', game: 'PUBG', role: 'Fragger' },
      case: {
        caseRef: 'FP-2026-0417',
        verdictAt: iso(now - 25 * HOUR),
        appealDeadline: deadline('himass', 47 * HOUR),
        violations: [
          { code: 'V1', type: 'aim-assist', matchId: 'PCS-R3-M4', evidenceStrength: 0.4, sanctionDays: 365 },
          { code: 'V2', type: 'toxic-chat', matchId: 'PCS-R3-M5', evidenceStrength: 1, sanctionDays: 14 },
          { code: 'V3', type: 'macro-abuse', matchId: 'PCS-R4-M1', evidenceStrength: 0.9, sanctionDays: 30 },
        ],
      },
      appeal: null,
    },
    tanvuu: {
      player: { playerId: 'tanvuu', handle: 'TanVuu', realName: 'Tan Vuu', team: 'S3T Phoenix', game: 'PUBG', role: 'IGL' },
      case: {
        caseRef: 'FP-2026-0422',
        verdictAt: iso(now - 71 * HOUR),
        appealDeadline: deadline('tanvuu', 50 * 60 * 1000),
        violations: [
          { code: 'V1', type: 'account-sharing', matchId: 'PCS-R2-M2', evidenceStrength: 0.8, sanctionDays: 90 },
          { code: 'V2', type: 'wallhack', matchId: 'PCS-R2-M3', evidenceStrength: 0.3, sanctionDays: 365 },
        ],
      },
      appeal: null,
    },
  };
}

const json = (status, data) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

/** In-memory stand-in for the Express API (validates with the SAME shared rules). */
function installFakeApi({ expired = [], dossierDelayMs = 0, rejectWith = null } = {}) {
  const dossiers = buildDossiers({ expired });
  const calls = [];

  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init = {}) => {
      const method = init.method ?? 'GET';
      const body = init.body ? JSON.parse(init.body) : undefined;
      calls.push({ url, method, body, signal: init.signal });

      if (url === '/api/time') return json(200, { now: Date.now() });
      if (url === '/api/players') return json(200, PLAYERS);

      const match = url.match(/^\/api\/dossiers\/([^/]+)(\/appeals)?$/);
      const dossier = match && dossiers[match[1]];
      if (!match) return json(404, { error: 'not found' });

      if (method === 'GET') {
        if (dossierDelayMs) await wait(dossierDelayMs, init.signal);
        return dossier ? json(200, dossier) : json(404, { error: `No dossier for player "${match[1]}"` });
      }

      // POST /appeals
      if (rejectWith) return json(rejectWith.status, { error: rejectWith.error });
      const kase = dossier.case;
      const errors = validateAppeal(body, {
        violationCodes: kase.violations.map((v) => v.code),
        excessiveCodes: computeMatrix(kase.violations).totals.excessiveCodes,
      });
      if (Object.keys(errors).length) return json(400, { error: 'Invalid appeal', errors });
      dossier.appeal = { ...body, playerId: match[1], caseRef: kase.caseRef, createdAt: iso(Date.now()) };
      return json(201, dossier.appeal);
    }),
  );

  return {
    dossierRequests: () => calls.filter((c) => c.method === 'GET' && c.url.startsWith('/api/dossiers/')),
    posts: () => calls.filter((c) => c.method === 'POST'),
  };
}

function renderApp(url = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(<RouterProvider router={router} />);
  return router;
}

const sidebar = () => screen.getByRole('navigation', { name: 'Player dossiers' });

async function fillValidAppeal(user) {
  await user.type(screen.getByLabelText('Contact email'), '  HiMass@Team.GG ');
  await user.selectOptions(screen.getByLabelText('Grounds for appeal'), 'disproportionate-sanction');
  await user.click(screen.getByLabelText(/^V1 ·/));
  await user.type(
    screen.getByLabelText('Statement'),
    'A 365-day ban for 40 percent evidence strength is five times the published guideline.',
  );
  await user.click(screen.getByLabelText('I confirm that this statement is truthful.'));
}

describe('dossier routing', () => {
  it('lists players in the sidebar and on the overview', async () => {
    installFakeApi();
    renderApp('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Fair-Play Appeal Tribunal' })).toBeInTheDocument();
    expect(await within(sidebar()).findByRole('link', { name: /Himass/ })).toHaveAttribute('href', '/dossier/himass');
    expect(screen.getByRole('link', { name: "Open TanVuu's dossier" })).toBeInTheDocument();
  });

  it('opens a dossier through the dynamic route and renders the derived matrix', async () => {
    const user = userEvent.setup();
    installFakeApi();
    renderApp('/');

    await user.click(await within(sidebar()).findByRole('link', { name: /Himass/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Himass' })).toBeInTheDocument();
    expect(within(sidebar()).getByRole('link', { name: /Himass/ })).toHaveAttribute('aria-current', 'page');

    const v1 = screen.getByRole('rowheader', { name: 'V1' }).closest('tr');
    expect(v1).toHaveTextContent('×5.07');
    expect(v1).toHaveTextContent('EXCESSIVE');
    expect(screen.getByRole('rowheader', { name: 'V3' }).closest('tr')).toHaveTextContent('LENIENT');
  });

  it('shows a 404 state for an unknown player', async () => {
    installFakeApi();
    renderApp('/dossier/ghost');
    expect(await screen.findByRole('heading', { name: 'Dossier not found' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('ghost');
  });

  it('aborts the previous dossier request when switching players quickly', async () => {
    const user = userEvent.setup();
    const api = installFakeApi({ dossierDelayMs: 80 });
    renderApp('/');

    await user.click(await within(sidebar()).findByRole('link', { name: /Himass/ }));
    await user.click(within(sidebar()).getByRole('link', { name: /TanVuu/ }));

    expect(await screen.findByRole('heading', { level: 1, name: 'TanVuu' })).toBeInTheDocument();
    const himassRequest = api.dossierRequests().find((c) => c.url.endsWith('/himass'));
    expect(himassRequest.signal.aborted).toBe(true);
    expect(screen.queryByRole('heading', { level: 1, name: 'Himass' })).not.toBeInTheDocument();
  });
});

describe('SLA countdown', () => {
  it('shows the remaining time and announces urgency once', async () => {
    installFakeApi();
    renderApp('/dossier/tanvuu');
    const countdown = await screen.findByTestId('sla-countdown');
    expect(countdown.textContent).toMatch(/^00:4\d:\d\d$/);
    expect(screen.getByRole('status')).toHaveTextContent('Less than one hour left');
  });

  it('closes the appeal window after the deadline', async () => {
    installFakeApi({ expired: ['himass'] });
    renderApp('/dossier/himass');
    expect(await screen.findByTestId('sla-countdown')).toHaveTextContent('Closed');
    expect(screen.getByRole('status')).toHaveTextContent('The appeal window has closed.');
    expect(screen.getByText(/No new appeals can be filed/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'File an appeal' })).not.toBeInTheDocument();
  });
});

describe('appeal form', () => {
  it('validates the cross-field rule in real time', async () => {
    const user = userEvent.setup();
    installFakeApi();
    renderApp('/dossier/himass/appeal');

    await user.selectOptions(await screen.findByLabelText('Grounds for appeal'), 'disproportionate-sanction');
    await user.click(screen.getByLabelText(/^V2 ·/));
    expect(screen.getByText(/must contest at least one violation marked EXCESSIVE/)).toBeInTheDocument();

    await user.click(screen.getByLabelText(/^V1 ·/));
    expect(screen.queryByText(/must contest at least one violation marked EXCESSIVE/)).not.toBeInTheDocument();
  });

  it('submits a normalised appeal and shows it on the dossier', async () => {
    const user = userEvent.setup();
    const api = installFakeApi();
    renderApp('/dossier/himass/appeal');
    await screen.findByLabelText('Contact email');

    await fillValidAppeal(user);
    await user.click(screen.getByRole('button', { name: 'Submit appeal' }));

    expect(await screen.findByRole('heading', { name: 'Appeal on file' })).toBeInTheDocument();
    expect(api.posts()[0].body).toMatchObject({
      email: 'himass@team.gg',
      grounds: 'disproportionate-sanction',
      contestedCodes: ['V1'],
      acknowledged: true,
    });
  });

  it('shows the server error when the tribunal rejects the appeal', async () => {
    const user = userEvent.setup();
    installFakeApi({ rejectWith: { status: 410, error: 'The appeal deadline has passed' } });
    renderApp('/dossier/himass/appeal');
    await screen.findByLabelText('Contact email');

    await fillValidAppeal(user);
    await user.click(screen.getByRole('button', { name: 'Submit appeal' }));
    expect(await screen.findByText(/The appeal deadline has passed/)).toBeInTheDocument();
  });
});