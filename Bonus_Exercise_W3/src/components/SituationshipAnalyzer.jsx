
import { useId, useState } from "react";

import {
  INITIAL_RELATIONSHIP_STATE,
  RELATIONSHIP_PHASE,
  RELATIONSHIP_EVENT,
  relationshipReducer,
} from "../domain/relationshipMachine.js";

import {
  EFFORT_ACTOR,
  createEffortSignal,
  calculateEffortImpact,
} from "../domain/effortCalculator.js";

import { appendEffortSignal } from "../domain/effortLog.js";
import { calculateEffortTotals } from "../domain/effortMetrics.js";
import { detectRedFlag } from "../domain/redFlagDetector.js";
import { useGhostingTimer } from "../hooks/useGhostingTimer.js";

import "./SituationshipAnalyzer.css";

const PHASES = [
  {
    value: RELATIONSHIP_PHASE.FRIENDS,
    label: "Friends",
    description: "A connection without romantic commitment.",
    shortLabel: "Friends",
  },
  {
    value: RELATIONSHIP_PHASE.DATING_NO_LOVE,
    label: "Dating Without Love",
    description: "Dating, but without confirmed mutual commitment.",
    shortLabel: "Situationship",
  },
  {
    value: RELATIONSHIP_PHASE.OFFICIAL_LOVE,
    label: "Official Love",
    description: "A mutually committed relationship.",
    shortLabel: "Committed",
  },
  {
    value: RELATIONSHIP_PHASE.GHOSTED_EXIT,
    label: "Ghosted Exit",
    description: "The relationship workflow has ended.",
    shortLabel: "Exited",
  },
];

const PHASE_LABELS = Object.fromEntries(
  PHASES.map((item) => [item.value, item.label]),
);

function getSignalId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `signal-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function MetricCard({
  label,
  metricName,
  description,
  value,
  barWidth,
  variant,
}) {
  return (
    <article className={`sa-metric sa-metric--${variant}`}>
      <div className="sa-metric__header">
        <span className="sa-metric__label">{label}</span>
        <span className="sa-metric__unit">Impact score</span>
      </div>

      <p className="sa-metric__value">
        {metricName}: {value.toFixed(2)}
      </p>

      <div className="sa-metric__track" aria-hidden="true">
        <span
          className="sa-metric__fill"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="sa-metric__description">{description}</p>
    </article>
  );
}

export function SituationshipAnalyzer() {
  const myTriesId = useId();
  const rivalTriesId = useId();

  const [phase, setPhase] = useState(
    INITIAL_RELATIONSHIP_STATE.phase,
  );

  const [myTries, setMyTries] = useState(100);
  const [rivalTries, setRivalTries] = useState(1);
  const [effortLog, setEffortLog] = useState([]);

  // Derived state: computed during rendering.
  const { myImpact, rivalImpact } =
    calculateEffortTotals(effortLog);

  const isRedFlag = detectRedFlag({
    phase,
    myImpact,
    rivalImpact,
  });

  const maxImpact = Math.max(myImpact, rivalImpact, 1);
  const myBarWidth = (myImpact / maxImpact) * 100;
  const rivalBarWidth = (rivalImpact / maxImpact) * 100;

  const currentPhaseIndex = PHASES.findIndex(
    (item) => item.value === phase,
  );

  const currentPhase = PHASES[currentPhaseIndex];

  useGhostingTimer(phase, myTries, setPhase);

  function dispatchEvent(eventType) {
    setPhase((currentPhaseValue) =>
      relationshipReducer(
        { phase: currentPhaseValue },
        { type: eventType },
      ).phase,
    );
  }

  function handleMyTriesChange(event) {
    const value = Number(event.target.value);

    setMyTries(
      Number.isFinite(value) && value >= 0 ? value : 0,
    );
  }

  function handleRivalTriesChange(event) {
    const value = Number(event.target.value);

    setRivalTries(
      Number.isFinite(value) && value >= 0 ? value : 0,
    );
  }

  function recordEffort(actor, steps) {
    const signal = createEffortSignal({
      id: getSignalId(),
      actor,
      steps,
    });

    setEffortLog((previousLog) =>
      appendEffortSignal(previousLog, signal),
    );
  }

  function recordMyEffort() {
    recordEffort(EFFORT_ACTOR.EM, myTries);
  }

  function recordRivalEffort() {
    recordEffort(EFFORT_ACTOR.AI_DO, rivalTries);
  }

  let statusMessage;

  if (isRedFlag) {
    statusMessage = "[RED-FLAG] Unequal effort detected!";
  } else if (effortLog.length === 0) {
    statusMessage =
      "[OK] Record effort from both participants to analyze the balance.";
  } else {
    statusMessage = "[OK] No red flag currently detected.";
  }

  return (
    <div className="sa-page">
      <div className="sa-container">

        {/* Header */}

        <header className="sa-header">
          <div className="sa-brand">
            <span className="sa-brand__mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>

            <span className="sa-brand__text">
              <strong>RELATIONSHIP</strong>
              <span>ANALYTICS LAB</span>
            </span>
          </div>

          <div className="sa-header__meta">
            <span className="sa-header__label">
              INTERACTIVE ANALYZER
            </span>
            <span className="sa-version">REACT 19</span>
          </div>
        </header>

        {/* Introduction */}

        <section
          className="sa-intro"
          aria-labelledby="sa-page-title"
        >
          <div className="sa-intro__main">
            <p className="sa-eyebrow">
              STATE MACHINE / RELATIONSHIP ANALYSIS
            </p>

            
            <h1
            id="sa-page-title"
            aria-label="Situationship Analyzer"
            >
            Situationship{" "}
            <span>Analyzer.</span>
            </h1>


            <p className="sa-intro__description">
              Understand the relationship state.
              Measure the effort. Identify the imbalance.
            </p>
          </div>

          <div className="sa-intro__aside">
            <span className="sa-intro__aside-label">
              SYSTEM STATUS
            </span>

            <div className="sa-system-status">
              <span
                className="sa-status-dot"
                aria-hidden="true"
              />
              <span>Analysis active</span>
            </div>

            <p>Deterministic relationship model</p>
          </div>
        </section>

        {/* Dashboard */}

        <div className="sa-dashboard-grid">

          <div className="sa-primary-column">

            {/* Relationship overview */}

            <section
              className="sa-card sa-phase-card"
              aria-labelledby="sa-phase-title"
            >
              <div className="sa-section-heading">
                <div>
                  <p className="sa-step-label">
                    01 / RELATIONSHIP
                  </p>
                  <h2 id="sa-phase-title">
                    Relationship Overview
                  </h2>
                </div>

                <span className="sa-section-index">FSM</span>
              </div>

              <div className="sa-current-phase">
                <div className="sa-current-phase__content">
                <p className="sa-current-phase__title">
                    Current phase: <strong>{PHASE_LABELS[phase]}</strong>
                </p>

                <p>{currentPhase?.description}</p>
               </div>

                <div
                  className="sa-phase-number"
                  aria-hidden="true"
                >
                  {String(currentPhaseIndex + 1).padStart(2, "0")}
                </div>
              </div>

              <ol
                className="sa-phase-track"
                aria-label="Relationship progression"
              >
                {PHASES.map((item, index) => {
                  const isCurrent = item.value === phase;
                  const isCompleted = index < currentPhaseIndex;

                  return (
                    <li
                      className={[
                        "sa-phase-track__item",
                        isCurrent ? "is-current" : "",
                        isCompleted ? "is-completed" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={item.value}
                      aria-current={
                        isCurrent ? "step" : undefined
                      }
                    >
                      <span
                        className="sa-phase-track__marker"
                        aria-hidden="true"
                      >
                        {isCompleted ? "✓" : index + 1}
                      </span>

                      <span className="sa-phase-track__label">
                        {item.shortLabel}
                      </span>
                    </li>
                  );
                })}
              </ol>

              <div
                className="sa-phase-actions"
                aria-label="Relationship phase actions"
              >
                {phase === RELATIONSHIP_PHASE.FRIENDS && (
                  <button
                    className="sa-button sa-button--primary"
                    type="button"
                    onClick={() =>
                      dispatchEvent(RELATIONSHIP_EVENT.START_DATING)
                    }
                  >
                    Start Dating
                    <span aria-hidden="true">→</span>
                  </button>
                )}

                {phase === RELATIONSHIP_PHASE.DATING_NO_LOVE && (
                  <>
                    <button
                      className="sa-button sa-button--secondary"
                      type="button"
                      onClick={() =>
                        dispatchEvent(
                          RELATIONSHIP_EVENT.RETURN_TO_FRIENDS,
                        )
                      }
                    >
                      Return to Friends
                    </button>

                    <button
                      className="sa-button sa-button--primary"
                      type="button"
                      onClick={() =>
                        dispatchEvent(RELATIONSHIP_EVENT.COMMIT)
                      }
                    >
                      Commit
                      <span aria-hidden="true">→</span>
                    </button>

                    <button
                      className="sa-button sa-button--danger"
                      type="button"
                      onClick={() =>
                        dispatchEvent(RELATIONSHIP_EVENT.GHOST)
                      }
                    >
                      Stop and Exit
                    </button>
                  </>
                )}
              </div>

              {phase === RELATIONSHIP_PHASE.DATING_NO_LOVE && (
                <div className="sa-timer-notice">
                  <span
                    className="sa-timer-notice__icon"
                    aria-hidden="true"
                  >
                    5s
                  </span>

                  <div>
                    <strong>Ghosting timer active</strong>
                    <p>
                      The relationship automatically exits
                      after five seconds unless the phase
                      changes. Editing your effort input
                      restarts this timer.
                    </p>
                  </div>
                </div>
              )}

              {phase === RELATIONSHIP_PHASE.GHOSTED_EXIT && (
                <div className="sa-exit-notice">
                  <strong>Relationship workflow ended</strong>
                  <p>
                    The situationship has reached its terminal
                    state.
                  </p>
                </div>
              )}

              {phase === RELATIONSHIP_PHASE.OFFICIAL_LOVE && (
                <div className="sa-success-notice">
                  <strong>Mutual commitment confirmed</strong>
                  <p>
                    The relationship has reached the official
                    commitment phase.
                  </p>
                </div>
              )}
            </section>

            {/* Effort input */}

            <section
              className="sa-card sa-input-card"
              aria-labelledby="sa-effort-title"
            >
              <div className="sa-section-heading">
                <div>
                  <p className="sa-step-label">
                    02 / INPUT DATA
                  </p>
                  <h2 id="sa-effort-title">Record Effort</h2>
                </div>

                <span className="sa-section-index">0.1 / 50</span>
              </div>

              <p className="sa-card-description">
                Record each participant's effort as an
                independent signal.
              </p>

              <div className="sa-input-grid">

                <div className="sa-input-panel sa-input-panel--mine">
                  <div className="sa-input-panel__header">
                    <span className="sa-participant-icon">
                      M
                    </span>

                    <div>
                      <h3>My Effort</h3>
                      <p>Multiplier × 0.1</p>
                    </div>
                  </div>

                  <label htmlFor={myTriesId}>
                    My effort (number of tries)
                  </label>

                  <input
                    className="sa-number-input"
                    id={myTriesId}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={myTries}
                    onChange={handleMyTriesChange}
                    aria-describedby={`${myTriesId}-help`}
                  />

                  <p
                    className="sa-input-help"
                    id={`${myTriesId}-help`}
                  >
                    Every try contributes 0.1 impact points.
                  </p>

                  <button
                    className="sa-button sa-button--primary sa-record-button"
                    type="button"
                    onClick={recordMyEffort}
                  >
                    Record My Effort
                    <span aria-hidden="true">+</span>
                  </button>
                </div>

                <div className="sa-input-panel sa-input-panel--rival">
                  <div className="sa-input-panel__header">
                    <span className="sa-participant-icon sa-participant-icon--rival">
                      R
                    </span>

                    <div>
                      <h3>Rival Effort</h3>
                      <p>Multiplier × 50.0</p>
                    </div>
                  </div>

                  <label htmlFor={rivalTriesId}>
                    Rival effort (number of tries)
                  </label>

                  <input
                    className="sa-number-input"
                    id={rivalTriesId}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={rivalTries}
                    onChange={handleRivalTriesChange}
                    aria-describedby={`${rivalTriesId}-help`}
                  />

                  <p
                    className="sa-input-help"
                    id={`${rivalTriesId}-help`}
                  >
                    Every try contributes 50.0 impact points.
                  </p>

                  <button
                    className="sa-button sa-button--dark sa-record-button"
                    type="button"
                    onClick={recordRivalEffort}
                  >
                    Record Rival Effort
                    <span aria-hidden="true">+</span>
                  </button>
                </div>

              </div>
            </section>
          </div>

          {/* Sidebar */}

          <aside className="sa-sidebar">

            <section
              className={`sa-card sa-balance-card ${
                isRedFlag ? "sa-balance-card--alert" : ""
              }`}
              aria-labelledby="sa-balance-title"
            >
              <div className="sa-section-heading">
                <div>
                  <p className="sa-step-label">
                    03 / DERIVED STATE
                  </p>
                  <h2 id="sa-balance-title">Effort Balance</h2>
                </div>
              </div>

              <div
                className={`sa-signal ${
                  isRedFlag
                    ? "sa-signal--alert"
                    : "sa-signal--normal"
                }`}
              >
                <span
                  className="sa-signal__symbol"
                  aria-hidden="true"
                >
                  {isRedFlag ? "!" : "✓"}
                </span>

                <div>
                  <span className="sa-signal__eyebrow">
                    CURRENT SIGNAL
                  </span>

                  <h3>
                    {isRedFlag
                      ? "Red flag detected"
                      : effortLog.length > 0
                        ? "No imbalance detected"
                        : "Awaiting data"}
                  </h3>
                </div>
              </div>

              <output
                className="sa-live-status"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {statusMessage}
              </output>

              <div className="sa-metrics">
                <MetricCard
                  label="MY IMPACT"
                  metricName="My impact"
                  description="Recorded effort × 0.1"
                  value={myImpact}
                  barWidth={myBarWidth}
                  variant="mine"
                />

                <MetricCard
                  label="RIVAL IMPACT"
                  metricName="Rival impact"
                  description="Recorded effort × 50.0"
                  value={rivalImpact}
                  barWidth={rivalBarWidth}
                  variant="rival"
                />
              </div>

              <div className="sa-balance-explanation">
                <p className="sa-field-caption">
                  DETECTION RULE
                </p>

                <code>
                  DATING_NO_LOVE &amp;&amp;
                  <br />
                  myImpact &lt; rivalImpact
                </code>

                <p>
                  Red Flag is derived directly from the
                  relationship phase and recorded effort totals.
                </p>
              </div>
            </section>

            <section className="sa-card sa-model-card">
              <p className="sa-step-label">MODEL SPECIFICATION</p>
              <h2>Asymmetric weighting</h2>

              <div className="sa-model-row">
                <span>EM</span>
                <strong>0.1×</strong>
              </div>

              <div className="sa-model-row">
                <span>AI_DO</span>
                <strong>50.0×</strong>
              </div>

              <p className="sa-model-note">
                Each participant uses a different impact
                multiplier. Total impact is calculated from
                immutable effort signals.
              </p>
            </section>
          </aside>
        </div>

        {/* Effort history */}

        <section
          className="sa-card sa-history-card"
          aria-labelledby="sa-history-title"
        >
          <div className="sa-section-heading">
            <div>
              <p className="sa-step-label">
                04 / IMMUTABLE EVENT LOG
              </p>

              <h2 id="sa-history-title">Effort History</h2>

              <p className="sa-card-description">
                A chronological record of all submitted effort
                signals.
              </p>
            </div>

            <span className="sa-history-count">
              {effortLog.length}{" "}
              {effortLog.length === 1 ? "SIGNAL" : "SIGNALS"}
            </span>
          </div>

          {effortLog.length === 0 ? (
            <div className="sa-empty-state">
              <span
                className="sa-empty-state__symbol"
                aria-hidden="true"
              >
                +
              </span>

              <h3>No effort signals recorded</h3>

              <p>
                Record an effort signal from either participant.
                The history will appear here.
              </p>
            </div>
          ) : (
            <ol className="sa-history-list">
              {effortLog.map((signal, index) => {
                const isMine =
                  signal.actor === EFFORT_ACTOR.EM;

                const impact = calculateEffortImpact(signal);

                return (
                  <li
                    className="sa-history-item"
                    key={signal.id}
                  >
                    <span
                      className={`sa-history-item__avatar ${
                        isMine
                          ? "sa-history-item__avatar--mine"
                          : "sa-history-item__avatar--rival"
                      }`}
                      aria-hidden="true"
                    >
                      {isMine ? "M" : "R"}
                    </span>

                    <div className="sa-history-item__main">
                      <strong>
                        {isMine ? "My Effort" : "Rival Effort"}
                      </strong>

                      <span>
                        Signal {String(index + 1).padStart(2, "0")}
                      </span>

                      <span>Steps: {signal.steps}</span>
                    </div>

                    <div className="sa-history-item__calculation">
                      <span>
                        Impact: {impact.toFixed(2)}
                      </span>
                    </div>

                    <span className="sa-history-item__multiplier">
                      × {signal.multiplier}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        {/* Footer */}

        <footer className="sa-footer">
          <p>
            SITUATIONSHIP ANALYZER
            <span aria-hidden="true"> / </span>
            REACT 19
          </p>

          <p>
            Finite State Machine · Derived State · Immutable Log
          </p>
        </footer>
      </div>
    </div>
  );
}
