import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

/**
 * Fetch the deck once. Explicit status machine instead of boolean soup:
 * 'loading' → 'success' | 'error'. `retry()` re-runs the effect.
 */
export function useProfiles() {
  const [state, setState] = useState({ status: 'loading', profiles: [], error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    api
      .getProfiles(controller.signal)
      .then((profiles) => setState({ status: 'success', profiles, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return; // StrictMode / unmount — not a real failure
        setState({ status: 'error', profiles: [], error: error.message });
      });

    return () => controller.abort();
  }, [attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
