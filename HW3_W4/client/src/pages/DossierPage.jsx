import { useMemo } from 'react';
import { Link, Outlet, useMatch, useOutletContext, useParams } from 'react-router';
import { computeMatrix } from '../../../shared/matrix.js';
import { GROUNDS } from '../../../shared/appealRules.js';
import { useDossier } from '../hooks/useDossier.js';
import { useAppealSlaTimer } from '../hooks/useAppealSlaTimer.js';
import { MatrixTable } from '../components/MatrixTable.jsx';
import { SlaCountdown } from '../components/SlaCountdown.jsx';
import { formatDateTime } from '../lib/format.js';

const groundsLabel = (value) => GROUNDS.find((g) => g.value === value)?.label ?? value;

/** One dynamic route for every player: /dossier/:playerID. */
export function DossierPage() {
  const { playerID } = useParams();
  const { clock } = useOutletContext();
  const isAppealRoute = useMatch('/dossier/:playerID/appeal') !== null;
  const { status, data, error, reload } = useDossier(playerID);

  const kase = data?.case ?? null;
  const violations = kase?.violations;
  // Disproportionality Derived Matrix — computed during render, memoised on the dossier data.
  const matrix = useMemo(() => computeMatrix(violations ?? []), [violations]);
  const sla = useAppealSlaTimer(kase?.appealDeadline ?? null, {
    offsetMs: clock.offsetMs,
    onResync: clock.resync,
  });

  if (status === 'loading') {
    return (
      <p className="loading" aria-busy="true">
        Loading dossier…
      </p>
    );
  }

  if (status === 'not-found') {
    return (
      <section className="page" role="alert">
        <h1>Dossier not found</h1>
        <p>
          There is no player with id <code>{playerID}</code>.
        </p>
        <p>
          <Link to="/">Back to the overview</Link>
        </p>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className="page" role="alert">
        <h1>Could not load the dossier</h1>
        <p>{error}</p>
        <button type="button" className="button" onClick={reload}>
          Retry
        </button>
      </section>
    );
  }

  const { player, appeal } = data;

  return (
    <article className="dossier" aria-labelledby="dossier-heading">
      <header className="dossier__header">
        <h1 id="dossier-heading">{player.handle}</h1>
        <p className="dossier__meta">
          {player.realName} · {player.role} · {player.team} · {player.game}
        </p>
      </header>

      {!kase ? (
        <p>No open fair-play case for this player.</p>
      ) : (
        <>
          <dl className="kv-list">
            <dt>Case</dt>
            <dd>{kase.caseRef}</dd>
            <dt>Verdict issued</dt>
            <dd>
              <time dateTime={kase.verdictAt}>{formatDateTime(kase.verdictAt)}</time>
            </dd>
          </dl>

          <SlaCountdown sla={sla} deadline={kase.appealDeadline} clockStatus={clock.status} />
          <MatrixTable matrix={matrix} />

          {appeal ? (
            <section className="notice" aria-labelledby="appeal-filed-heading">
              <h2 id="appeal-filed-heading">Appeal on file</h2>
              <p>
                Filed {formatDateTime(appeal.createdAt)} on the grounds “{groundsLabel(appeal.grounds)}”, contesting{' '}
                {appeal.contestedCodes.join(', ')}.
              </p>
            </section>
          ) : sla.isExpired ? (
            <p className="notice notice--error">The appeal window has closed. No new appeals can be filed.</p>
          ) : (
            !isAppealRoute && (
              <p>
                <Link className="button" to="appeal">
                  File an appeal
                </Link>
              </p>
            )
          )}

          <Outlet context={{ playerId: player.playerId, kase, matrix, sla, appeal, onFiled: reload }} />
        </>
      )}
    </article>
  );
}