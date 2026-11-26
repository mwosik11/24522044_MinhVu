import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { splitDuration, useAppealSlaTimer } from './useAppealSlaTimer.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const T0 = new Date('2026-11-26T10:00:00.000Z').getTime();

let visibility = 'visible';
function setVisibility(state) {
  visibility = state;
  document.dispatchEvent(new Event('visibilitychange'));
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
  visibility = 'visible';
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
});

const renderTimer = (deadline, options) => renderHook(() => useAppealSlaTimer(deadline, options));

/**
 * Advance fake time in steps, one act() per step, so React re-renders and the hook
 * can schedule its next setTimeout between ticks (as it does in a real browser).
 */
function advance(ms, step = SECOND) {
  for (let elapsed = 0; elapsed < ms; elapsed += step) {
    act(() => vi.advanceTimersByTime(Math.min(step, ms - elapsed)));
  }
}

describe('splitDuration', () => {
  it('splits milliseconds into days, hours, minutes and seconds', () => {
    expect(splitDuration(1 * 24 * HOUR + HOUR + MINUTE + SECOND + 999)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
  });
});

describe('useAppealSlaTimer', () => {
  it('computes the remaining time from the absolute deadline', () => {
    const { result } = renderTimer(new Date(T0 + 2 * HOUR).toISOString());
    expect(result.current).toMatchObject({ remainingMs: 2 * HOUR, hours: 2, minutes: 0, seconds: 0, isUrgent: false });
  });

  it('ticks once per second', () => {
    const { result } = renderTimer(T0 + 2 * HOUR);
    act(() => vi.advanceTimersByTime(SECOND));
    expect(result.current).toMatchObject({ hours: 1, minutes: 59, seconds: 59 });
  });

    it('has zero drift after an hour of ticks', () => {
    const { result } = renderTimer(T0 + 2 * HOUR);
    advance(HOUR); // 3600 real ticks, each recomputed from Date.now()
    expect(result.current.remainingMs).toBe(HOUR);
  });

  it('jumps to the correct value when a throttled tab becomes visible again', () => {
    const onResync = vi.fn();
    const { result } = renderTimer(T0 + 2 * HOUR, { onResync });

    act(() => setVisibility('hidden'));
    vi.setSystemTime(T0 + 10 * MINUTE); // wall clock moved, timers did not fire
    expect(result.current.minutes).toBe(0); // stale until the tab is visible

    act(() => setVisibility('visible'));
    expect(result.current).toMatchObject({ hours: 1, minutes: 50, seconds: 0 });
    expect(onResync).toHaveBeenCalledTimes(1);
  });

  it('does not resync when the tab is hidden', () => {
    const onResync = vi.fn();
    renderTimer(T0 + HOUR, { onResync });
    act(() => setVisibility('hidden'));
    expect(onResync).not.toHaveBeenCalled();
  });

  it('applies the server clock offset', () => {
    // Server clock is 1 minute ahead of this machine → 1 minute less remains.
    const { result } = renderTimer(T0 + 2 * HOUR, { offsetMs: MINUTE });
    expect(result.current).toMatchObject({ hours: 1, minutes: 59 });
  });

  it('flags the last hour as urgent', () => {
    expect(renderTimer(T0 + 59 * MINUTE).result.current.isUrgent).toBe(true);
    expect(renderTimer(T0 + HOUR).result.current.isUrgent).toBe(false);
  });

    it('expires at zero and stops scheduling timers', () => {
    const { result } = renderTimer(T0 + 1500);
    advance(2 * SECOND);
    expect(result.current).toMatchObject({ remainingMs: 0, isExpired: true, isUrgent: false });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('removes its listener and timer on unmount', () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = renderTimer(T0 + HOUR);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stays idle without a deadline', () => {
    const { result } = renderTimer(null);
    expect(result.current).toMatchObject({ remainingMs: 0, isExpired: false });
    expect(vi.getTimerCount()).toBe(0);
  });
});