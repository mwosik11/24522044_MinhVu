
import { useEffect, useId, useState } from 'react';

import {
  STATUS,
  createInitialState,
  transition,
} from '../utils/telemetry-state-machine.js';

import { fetchKraftonPubgTelemetry } from '../services/krafton-telemetry-service.js';

import { PUBG_VN_SQUADS } from '../data/pubg-vn-telemetry-spec.js';

import BlueZoneSkeleton from './BlueZoneSkeleton.jsx';

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

  return (
    <main>
      <h1>KRAFTON PUBG VN Live Match Telemetry</h1>

      <label htmlFor={squadSelectId}>
        Select PUBG VN Squad
      </label>

      <select
        id={squadSelectId}
        value={selectedSquadId}
        onChange={handleSquadChange}
      >
        {PUBG_VN_SQUADS.map((squad) => (
          <option key={squad.id} value={squad.id}>
            {squad.name}
          </option>
        ))}
      </select>

      <section aria-live="polite">
        <p>Current status: {telemetryState.status}</p>

        {telemetryState.status === STATUS.LOADING && (
          <BlueZoneSkeleton />
        )}

        {telemetryState.status === STATUS.SUCCESS && (
          <article>
            <h2>{telemetryState.data.name}</h2>

            <p>Map: {telemetryState.data.map}</p>
            <p>Phase: {telemetryState.data.phase}</p>
            <p>Alive: {telemetryState.data.alive}</p>
            <p>Kills: {telemetryState.data.kills}</p>
            <p>
              WWCD Probability: {telemetryState.data.wwcdProb}
            </p>
            <p>Status: {telemetryState.data.status}</p>
          </article>
        )}

        {telemetryState.status === STATUS.ERROR && (
          <section role="alert">
            <h2>Satellite Connection Lost</h2>

            <p>{telemetryState.error}</p>

            <p>Retry attempts: {retryCount}</p>

            <button
              type="button"
              onClick={handleReconnect}
            >
              Reconnect Satellite
            </button>
          </section>
        )}
      </section>
    </main>
  );
}
