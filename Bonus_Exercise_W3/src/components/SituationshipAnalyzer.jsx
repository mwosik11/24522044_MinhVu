
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

const PHASE_LABELS = {
  [RELATIONSHIP_PHASE.FRIENDS]: "Friends",
  [RELATIONSHIP_PHASE.DATING_NO_LOVE]: "Dating Without Love",
  [RELATIONSHIP_PHASE.OFFICIAL_LOVE]: "Official Love",
  [RELATIONSHIP_PHASE.GHOSTED_EXIT]: "Ghosted Exit",
};

export function SituationshipAnalyzer() {
  const myTriesId = useId();
  const rivalTriesId = useId();

  const [phase, setPhase] = useState(
    INITIAL_RELATIONSHIP_STATE.phase,
  );

  const [myTries, setMyTries] = useState(100);
  const [rivalTries, setRivalTries] = useState(1);

  const [effortLog, setEffortLog] = useState([]);

  // Derived metrics calculated directly during rendering.
  const { myImpact, rivalImpact } =
    calculateEffortTotals(effortLog);

  const isRedFlag = detectRedFlag({
    phase,
    myImpact,
    rivalImpact,
  });

  useGhostingTimer(phase, myTries, setPhase);

  function dispatchEvent(eventType) {
    setPhase((currentPhase) =>
      relationshipReducer(
        { phase: currentPhase },
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
      id: crypto.randomUUID(),
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

  return (
    <article aria-label="Hen Ho Khong Yeu Analyzer">
      <header>
        <h1>Situationship Analyzer</h1>
        <p>Analyze relationship states and asymmetric effort.</p>
      </header>

      <section aria-labelledby="relationship-phase-heading">
        <h2 id="relationship-phase-heading">
          Relationship Phase
        </h2>

        <p>
          Current phase: <strong>{PHASE_LABELS[phase]}</strong>
        </p>

        {phase === RELATIONSHIP_PHASE.FRIENDS && (
          <button
            type="button"
            onClick={() =>
              dispatchEvent(RELATIONSHIP_EVENT.START_DATING)
            }
          >
            Start Dating
          </button>
        )}

        {phase === RELATIONSHIP_PHASE.DATING_NO_LOVE && (
          <>
            <button
              type="button"
              onClick={() =>
                dispatchEvent(RELATIONSHIP_EVENT.RETURN_TO_FRIENDS)
              }
            >
              Return to Friends
            </button>

            <button
              type="button"
              onClick={() =>
                dispatchEvent(RELATIONSHIP_EVENT.COMMIT)
              }
            >
              Commit
            </button>

            <button
              type="button"
              onClick={() =>
                dispatchEvent(RELATIONSHIP_EVENT.GHOST)
              }
            >
              Stop and Exit
            </button>
          </>
        )}
      </section>

      <section aria-labelledby="effort-heading">
        <h2 id="effort-heading">Asymmetric Effort</h2>

        <div>
          <label htmlFor={myTriesId}>
            My effort (number of tries)
          </label>

          <input
            id={myTriesId}
            type="number"
            min="0"
            value={myTries}
            onChange={handleMyTriesChange}
          />

          <button type="button" onClick={recordMyEffort}>
            Record My Effort
          </button>
        </div>

        <div>
          <label htmlFor={rivalTriesId}>
            Rival effort (number of tries)
          </label>

          <input
            id={rivalTriesId}
            type="number"
            min="0"
            value={rivalTries}
            onChange={handleRivalTriesChange}
          />

          <button type="button" onClick={recordRivalEffort}>
            Record Rival Effort
          </button>
        </div>

        <h3>Total Effort Impact</h3>

        <p>My impact: {myImpact.toFixed(2)}</p>
        <p>Rival impact: {rivalImpact.toFixed(2)}</p>
      </section>

      <section aria-labelledby="red-flag-heading">
        <h2 id="red-flag-heading">Red-Flag Detection</h2>

        <output
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {isRedFlag
            ? "[RED-FLAG] Unequal effort detected!"
            : "[OK] Relationship is stable."}
        </output>
      </section>

      <section aria-labelledby="effort-history-heading">
        <h2 id="effort-history-heading">Effort History</h2>

        {effortLog.length === 0 ? (
          <p>No effort signals recorded yet.</p>
        ) : (
          <ol>
            {effortLog.map((signal) => (
              <li key={signal.id}>
                <p>
                  Participant:{" "}
                  <strong>
                    {signal.actor === EFFORT_ACTOR.EM
                      ? "Me"
                      : "Rival"}
                  </strong>
                </p>

                <p>Steps: {signal.steps}</p>
                <p>Multiplier: {signal.multiplier}</p>

                <p>
                  Impact:{" "}
                  {calculateEffortImpact(signal).toFixed(2)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}
