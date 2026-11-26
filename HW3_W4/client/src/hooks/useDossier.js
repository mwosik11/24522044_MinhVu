import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const LOADING = { status: 'loading', data: null, error: null };

/**
 * Dossier for one player: 'loading' → 'success' | 'not-found' | 'error'.
 * Switching /dossier/himass → /dossier/tanvuu aborts the in-flight request,
 * so a slow Himass response can never overwrite TanVuu's page.
 */
export function useDossier(playerId) {
  const [state, setState] = useState({ ...LOADING, playerId });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ ...LOADING, playerId });

    api
      .getDossier(playerId, controller.signal)
      .then((data) => setState({ status: 'success', data, error: null, playerId }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ status: error.status === 404 ? 'not-found' : 'error', data: null, error: error.message, playerId });
      });

    return () => controller.abort();
  }, [playerId, attempt]);

  // During the first render after a route change the state still belongs to the
  // previous player — never show it.
  const current = state.playerId === playerId ? state : LOADING;
  return { status: current.status, data: current.data, error: current.error, reload: () => setAttempt((n) => n + 1) };
}