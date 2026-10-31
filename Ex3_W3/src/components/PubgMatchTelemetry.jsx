
import { useEffect, useId, useState } from 'react';

import {
  STATUS,
  createInitialState,
  transition,
} from '../utils/telemetry-state-machine.js';
import { fetchKraftonPubgTelemetry } from '../services/krafton-telemetry-service.js';
import { PUBG_VN_SQUADS } from '../data/pubg-vn-telemetry-spec.js';
import BlueZoneSkeleton from './BlueZoneSkeleton.jsx';
import './PubgMatchTelemetry.css';

const STATUS_LABELS = {
  [STATUS.IDLE]: 'STANDBY',
  [STATUS.LOADING]: 'SYNCING FEED',
  [STATUS.SUCCESS]: 'SIGNAL ACTIVE',
  [STATUS.ERROR]: 'LINK DEGRADED',
};

function StatCard({ label, value, detail, accent = false, progress }) {
  return (
    <article className={`stat-card${accent ? ' stat-card--accent' : ''}`}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__detail">{detail}</p>

      {progress !== undefined && (
        <span className="stat-card__progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
      )}
    </article>
  );
}

export default function PubgMatchTelemetry() {
  const squadSelectId = useId();

  const [selectedSquadId, setSelectedSquadId] = useState(
    PUBG_VN_SQUADS[0].id,
  );

  const [telemetryState, setTelemetryState] = useState(
    createInitialState,
  );

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setTelemetryState((currentState) =>
      transition(currentState, {
        status: STATUS.LOADING,
      }),
    );

    async function loadTelemetry() {
      try {
        const data = await fetchKraftonPubgTelemetry(
          selectedSquadId,
          { signal: controller.signal },
        );

        if (controller.signal.aborted) {
          return;
        }

        setTelemetryState((currentState) =>
          transition(currentState, {
            status: STATUS.SUCCESS,
            data,
          }),
        );
      } catch (error) {
        if (
          error.name === 'AbortError' ||
          controller.signal.aborted
        ) {
          return;
        }

        setTelemetryState((currentState) =>
          transition(currentState, {
            status: STATUS.ERROR,
            error: error.message,
          }),
        );
      }
    }

    loadTelemetry();

    return () => {
      controller.abort();
    };
  }, [selectedSquadId, retryCount]);

  function handleSquadChange(event) {
    setSelectedSquadId(event.target.value);
  }

  function handleReconnect() {
    setRetryCount((count) => count + 1);
  }

  const telemetry = telemetryState.status === STATUS.SUCCESS
    ? telemetryState.data
    : null;

  const wwcdProgress = telemetry
    ? Number.parseInt(telemetry.wwcdProb, 10)
    : 0;

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <a
          className="brand-lockup"
          href="#main-content"
          aria-label="PUBG Vietnam Series dashboard home"
        >
          <span className="brand-mark" aria-hidden="true">
            P
          </span>

          <span className="brand-copy">
            <span className="brand-name">
              KRAFTON <span>/</span> PUBG VN
            </span>

            <span className="brand-caption">
              VIETNAM SERIES · MATCH INTELLIGENCE
            </span>
          </span>
        </a>

        <p className="simulation-label">
          <span
            className="simulation-label__dot"
            aria-hidden="true"
          />
          SIMULATED TELEMETRY FEED
        </p>
      </header>

      <section
        className="dashboard-intro"
        aria-labelledby="page-title"
      >
        <div className="dashboard-intro__copy">
          <p className="eyebrow">
            PERFORMANCE INTELLIGENCE <span>/</span> VIETNAM
          </p>

          <h1 id="page-title">
            Match <span>intelligence.</span>
          </h1>

          <p className="dashboard-intro__description">
            Squad-level match telemetry, tactical context, and
            satellite link status.
          </p>
        </div>

        <p
          className="dashboard-index"
          aria-label="Dashboard section 01"
        >
          <span>01</span>

          <span className="dashboard-index__caption">
            LIVE MATCH
            <br />
            MONITOR
          </span>
        </p>
      </section>

      <section
        className="control-panel"
        aria-label="Squad and connection controls"
      >
        <div className="control-panel__copy">
          <p className="eyebrow">TRACKING SQUAD</p>

          <p className="control-panel__hint">
            Select a professional squad to inspect
          </p>
        </div>

        <div className="control-panel__actions">
          <div className="squad-select-wrap">
            <label htmlFor={squadSelectId}>
              Squad
            </label>

            <select
              id={squadSelectId}
              className="squad-select"
              value={selectedSquadId}
              onChange={handleSquadChange}
            >
              {PUBG_VN_SQUADS.map((squad) => (
                <option key={squad.id} value={squad.id}>
                  {squad.name}
                </option>
              ))}
            </select>
          </div>

          <span
            className={`status-pill status-pill--${telemetryState.status.toLowerCase()}`}
          >
            <span
              className="status-pill__dot"
              aria-hidden="true"
            />
            {STATUS_LABELS[telemetryState.status]}
          </span>
        </div>
      </section>

      <section
        id="main-content"
        className="dashboard-content"
        aria-live="polite"
        aria-atomic="true"
      >
        {telemetryState.status === STATUS.LOADING && (
          <BlueZoneSkeleton />
        )}

        {telemetryState.status === STATUS.ERROR && (
          <section
            className="error-panel"
            role="alert"
            aria-labelledby="error-title"
          >
            <span
              className="error-panel__icon"
              aria-hidden="true"
            >
              !
            </span>

            <div className="error-panel__body">
              <p className="eyebrow">
                SATELLITE CONNECTION
              </p>

              <h2 id="error-title">
                Signal interrupted
              </h2>

              <p className="error-panel__message">
                {telemetryState.error}
              </p>

              <p className="error-panel__attempts">
                RECONNECT ATTEMPTS
                <strong>{retryCount}</strong>
              </p>
            </div>

            <button
              className="reconnect-button"
              type="button"
              onClick={handleReconnect}
            >
              <span aria-hidden="true">↻</span>
              Reconnect Satellite
            </button>
          </section>
        )}

        {telemetry && (
          <section
            className="dashboard-grid"
            aria-label="Squad match telemetry"
          >
            <article className="match-overview">
              <header className="panel-heading">
                <div>
                  <p className="eyebrow">
                    LIVE SQUAD PROFILE
                  </p>

                  <h2>{telemetry.name}</h2>
                </div>

                <span className="squad-code">
                  {selectedSquadId.toUpperCase()}
                  <span> / </span>
                  PVS
                </span>
              </header>

              <section
                className="match-context"
                aria-label="Match context"
              >
                <div className="context-item">
                  <span className="context-item__label">
                    BATTLE MAP
                  </span>

                  <strong>{telemetry.map}</strong>
                </div>

                <span
                  className="context-divider"
                  aria-hidden="true"
                />

                <div className="context-item">
                  <span className="context-item__label">
                    CURRENT PHASE
                  </span>

                  <strong>{telemetry.phase}</strong>
                </div>
              </section>

              <section
                className="stats-grid"
                aria-label="Squad performance metrics"
              >
                <StatCard
                  label="TOTAL KILLS"
                  value={telemetry.kills}
                  detail="Squad eliminations"
                  accent
                />

                <StatCard
                  label="PLAYERS ALIVE"
                  value={telemetry.alive}
                  detail="Active squad roster"
                />

                <StatCard
                  label="WWCD PROBABILITY"
                  value={telemetry.wwcdProb}
                  detail="Estimated win chance"
                  progress={wwcdProgress}
                />
              </section>

              <footer className="match-overview__footer">
                <span
                  className="footer-indicator"
                  aria-hidden="true"
                />

                <span className="match-overview__footer-label">
                  FIELD UPDATE
                </span>

                <strong>{telemetry.status}</strong>
              </footer>
            </article>

            <aside
              className="signal-panel"
              aria-label="Satellite telemetry status"
            >
              <header className="signal-panel__header">
                <div>
                  <p className="eyebrow">
                    TACTICAL SYSTEMS
                  </p>

                  <h2>Signal overview</h2>
                </div>

                <span className="signal-panel__serial">
                  SYS.01
                </span>
              </header>

              <section
                className="radar-display"
                aria-label={`Decorative telemetry signal visualization for ${telemetry.map}`}
              >
                <span className="radar-ring radar-ring--outer" />
                <span className="radar-ring radar-ring--middle" />
                <span className="radar-ring radar-ring--inner" />

                <span className="radar-crosshair radar-crosshair--horizontal" />
                <span className="radar-crosshair radar-crosshair--vertical" />

                <span className="radar-sweep" />
                <span className="radar-point radar-point--primary" />
                <span className="radar-point radar-point--secondary" />
                <span className="radar-center" />

                <span className="radar-coordinate radar-coordinate--top">
                  VN / PVS
                </span>

                <span className="radar-coordinate radar-coordinate--bottom">
                  SIGNAL LOCKED
                </span>
              </section>

              <section
                className="signal-readout"
                aria-label="Telemetry readout"
              >
                <div>
                  <span className="signal-readout__label">
                    MAP SIGNAL
                  </span>

                  <strong>{telemetry.map}</strong>
                </div>

                <span className="signal-readout__status">
                  <span
                    className="status-pill__dot"
                    aria-hidden="true"
                  />
                  NOMINAL
                </span>
              </section>

              <footer className="signal-panel__footer">
                <span>TELEMETRY MODE</span>
                <strong>SIMULATION</strong>
              </footer>
            </aside>
          </section>
        )}
      </section>

      <footer className="dashboard-footer">
        <span>
          KRAFTON <span className="dashboard-footer__slash">/</span>
          PUBG VIETNAM SERIES
        </span>

        <span>
          TRAINING INTERFACE
          <span className="dashboard-footer__separator"> · </span>
          35% PACKET-LOSS MODEL
        </span>
      </footer>
    </main>
  );
}
