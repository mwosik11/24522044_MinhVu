import { useEffect, useReducer, useRef, useState } from 'react';
import { api } from '../api/client.js';
import {
  DIRECTION_TO_ACTION,
  SCORE_RULES,
  computeScore,
  computeStats,
  getRemainingProfiles,
  initialSwipeState,
  swipeReducer,
} from '../lib/swipeLogic.js';

const SESSION_KEY = 'swipe-deck:sessionId';

/** One anonymous session per browser. Storage can throw (private mode) → fall back to memory. */
export function getOrCreateSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

const VERB = { LIKE: 'Liked', NOPE: 'Passed on', FRIENDZONE: 'Friendzoned' };
const formatPoints = (n) => (n > 0 ? `+${n}` : String(n));

/**
 * Swipe session = LIFO history (reducer) + optimistic persistence to the API.
 * Score, stats and the remaining deck are DERIVED from the history every render.
 */
export function useSwipeSession(profiles) {
  const [sessionId] = useState(getOrCreateSessionId);
  const [state, dispatch] = useReducer(swipeReducer, initialSwipeState);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready'
  const [error, setError] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  // clientId → Promise<boolean> of the in-flight POST. Undo must wait for it,
  // otherwise DELETE can reach the server before the POST and the swipe survives.
  const pendingPosts = useRef(new Map());

  // Restore this session's history from the server (external system → effect).
  useEffect(() => {
    const controller = new AbortController();
    api
      .getSwipes(sessionId, controller.signal)
      .then((swipes) => {
        dispatch({
          type: 'HYDRATE',
          history: swipes.map(({ clientId, profileSlug, action }) => ({ clientId, profileSlug, action })),
        });
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(`Could not restore your previous swipes: ${err.message}`);
        setStatus('ready'); // still playable; new swipes will be saved
      });
    return () => controller.abort();
  }, [sessionId]);

  // ---- Derived state ----
  const { history } = state;
  const remaining = getRemainingProfiles(profiles, history);
  const current = remaining[0] ?? null;
  const score = computeScore(history);
  const stats = computeStats(history);
  const canUndo = history.length > 0;
  const profileBySlug = (slug) => profiles.find((p) => p.slug === slug);

  // ---- Actions ----
  function swipe(direction) {
    const action = DIRECTION_TO_ACTION[direction];
    if (!action || !current || status !== 'ready') return;

    const entry = { clientId: crypto.randomUUID(), profileSlug: current.slug, action };
    dispatch({ type: 'SWIPE', entry });
    setError(null);
    setAnnouncement(`${VERB[action]} ${current.name} (${formatPoints(SCORE_RULES[action])}).`);

    const post = api
      .postSwipe({ ...entry, sessionId })
      .then(() => true)
      .catch((err) => {
        dispatch({ type: 'ROLLBACK_SWIPE', clientId: entry.clientId });
        setError(`Swipe on ${current.name} was not saved: ${err.message}`);
        return false;
      })
      .finally(() => pendingPosts.current.delete(entry.clientId));
    pendingPosts.current.set(entry.clientId, post);
  }

  async function undo() {
    const entry = history.at(-1);
    if (!entry) return;

    dispatch({ type: 'UNDO' });
    setError(null);
    setAnnouncement(`Undid ${VERB[entry.action].toLowerCase()} ${profileBySlug(entry.profileSlug)?.name ?? 'profile'}.`);

    const wasSaved = await (pendingPosts.current.get(entry.clientId) ?? Promise.resolve(true));
    if (!wasSaved) return; // POST failed → nothing to delete on the server

    try {
      await api.deleteSwipe(entry.clientId, sessionId);
    } catch (err) {
      dispatch({ type: 'RESTORE_ENTRY', entry });
      setError(`Undo failed, the swipe is still saved: ${err.message}`);
    }
  }

  return {
    status,
    error,
    announcement,
    history,
    remaining,
    current,
    score,
    stats,
    canUndo,
    profileBySlug,
    swipe,
    undo,
  };
}