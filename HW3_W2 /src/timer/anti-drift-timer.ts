
export type AntiDriftTimerCleanup = () => void;

/**
 * Creates a countdown timer based on an absolute target time.
 *
 * The remaining time is recalculated from Date.now() on every frame,
 * avoiding cumulative drift caused by decrementing a counter.
 *
 * @param durationMs Countdown duration in milliseconds.
 * @param onTick Receives the remaining time in milliseconds.
 * @returns A cleanup function that stops the timer.
 */
export function createAntiDriftTimer(
  durationMs: number,
  onTick: (remaining: number) => void,
): AntiDriftTimerCleanup {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new RangeError('durationMs must be a finite, non-negative number.');
  }

  const targetTime = Date.now() + durationMs;
  let rafId: number | null = null;
  let stopped = false;

  const cleanup = (): void => {
    if (stopped) {
      return;
    }

    stopped = true;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const tick = (): void => {
    if (stopped) {
      return;
    }

    const remaining = Math.max(0, targetTime - Date.now());

    onTick(remaining);

    if (stopped || remaining === 0) {
      stopped = true;
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  tick();

  return cleanup;
}
