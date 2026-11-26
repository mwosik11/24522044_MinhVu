import { useEffect, useState } from 'react';

/**
 * offset = serverNow − (local time at the midpoint of the request).
 * Half the round-trip is assumed to be the server's processing moment (NTP-style).
 */
export function computeClockOffset(sentAt, serverNow, receivedAt) {
  return Math.round(serverNow - (sentAt + (receivedAt - sentAt) / 2));
}

/**
 * Measures how far this machine's clock is from the server's authoritative clock.
 * A user who changes their OS clock cannot extend the appeal deadline.
 */
export function useServerClock() {
  const [state, setState] = useState({ offsetMs: 0, status: 'syncing', error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const sentAt = Date.now();

    fetch('/api/time', { signal: controller.signal, cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`Clock sync failed (${response.status})`);
        return response.json();
      })
      .then(({ now }) => {
        setState({ offsetMs: computeClockOffset(sentAt, now, Date.now()), status: 'synced', error: null });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        // Keep the previous offset (0 on first load) → the timer falls back to the local clock.
        setState((prev) => ({ ...prev, status: 'error', error: error.message }));
      });

    return () => controller.abort();
  }, [attempt]);

  return { ...state, resync: () => setAttempt((n) => n + 1) };
}