import { useEffect, useEffectEvent, useState } from 'react';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
export const URGENT_THRESHOLD_MS = HOUR;

export function splitDuration(ms) {
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / MINUTE),
    seconds: Math.floor((ms % MINUTE) / SECOND),
  };
}

/** Delay until the displayed second changes — ticks land on second boundaries. */
const msUntilNextSecond = (remainingMs) => remainingMs % SECOND || SECOND;

const toEpochMs = (deadline) => {
  if (deadline === null || deadline === undefined) return null;
  const ms = new Date(deadline).getTime();
  return Number.isNaN(ms) ? null : ms;
};

/**
 * Zero-drift SLA countdown.
 * - Stores ONLY the current "now"; remaining time is recomputed from absolute timestamps,
 *   so late or throttled timers can never accumulate error (no `seconds - 1` counters).
 * - `offsetMs` = server clock − local clock (from useServerClock).
 * - When the tab becomes visible again: recompute immediately and call onResync()
 *   so the caller can re-measure the server offset.
 *
 * @param {string|number|Date|null} deadline
 * @param {{ offsetMs?: number, onResync?: () => void }} [options]
 */
export function useAppealSlaTimer(deadline, { offsetMs = 0, onResync } = {}) {
  const deadlineMs = toEpochMs(deadline);
  const [now, setNow] = useState(() => Date.now());

  const remainingMs = deadlineMs === null ? 0 : Math.max(0, deadlineMs - (now + offsetMs));
  const isExpired = deadlineMs !== null && remainingMs === 0;

  // 1. Tick: one setTimeout at a time, aligned to the next second boundary.
  useEffect(() => {
    if (deadlineMs === null || isExpired) return;
    const id = setTimeout(() => setNow(Date.now()), msUntilNextSecond(remainingMs));
    return () => clearTimeout(id);
  }, [deadlineMs, isExpired, remainingMs]);

  // 2. Page Visibility API: background tabs throttle timers → resync on return.
  const handleVisible = useEffectEvent(() => {
    setNow(Date.now());
    onResync?.();
  });

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') handleVisible();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return {
    remainingMs,
    ...splitDuration(remainingMs),
    isExpired,
    isUrgent: !isExpired && remainingMs > 0 && remainingMs < URGENT_THRESHOLD_MS,
  };
}