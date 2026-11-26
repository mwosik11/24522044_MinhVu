import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

/** Sidebar player list: 'loading' → 'success' | 'error'. */
export function usePlayers() {
  const [state, setState] = useState({ status: 'loading', players: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    api
      .getPlayers(controller.signal)
      .then((players) => setState({ status: 'success', players, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ status: 'error', players: [], error: error.message });
      });
    return () => controller.abort();
  }, []);

  return state;
}