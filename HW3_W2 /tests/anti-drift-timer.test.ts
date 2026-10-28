
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAntiDriftTimer } from '../src/timer/anti-drift-timer';

describe('createAntiDriftTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reports the initial remaining time immediately', () => {
    const onTick = vi.fn();

    createAntiDriftTimer(5_000, onTick);

    expect(onTick).toHaveBeenCalledWith(5_000);
  });

  it('recalculates remaining time from the current clock', () => {
    const onTick = vi.fn();
    const callback = vi.mocked(requestAnimationFrame).mock.calls[0]?.[0];

    createAntiDriftTimer(5_000, onTick);

    const frame = vi.mocked(requestAnimationFrame).mock.calls[0]?.[0];
    expect(frame).toBeDefined();

    vi.setSystemTime(new Date('2026-01-01T00:00:02.000Z'));
    frame?.(16);

    expect(onTick).toHaveBeenLastCalledWith(3_000);
    expect(callback).toBeUndefined();
  });

  it('stops scheduling frames when the countdown reaches zero', () => {
    const onTick = vi.fn();

    createAntiDriftTimer(1_000, onTick);

    const frame = vi.mocked(requestAnimationFrame).mock.calls[0]?.[0];
    expect(frame).toBeDefined();

    vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
    frame?.(16);

    expect(onTick).toHaveBeenLastCalledWith(0);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending frame on cleanup', () => {
    const onTick = vi.fn();
    const cleanup = createAntiDriftTimer(5_000, onTick);

    cleanup();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  it('does not schedule a frame when duration is zero', () => {
    const onTick = vi.fn();

    createAntiDriftTimer(0, onTick);

    expect(onTick).toHaveBeenCalledWith(0);
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('rejects negative and non-finite durations', () => {
    expect(() => createAntiDriftTimer(-1, vi.fn())).toThrow(RangeError);
    expect(() => createAntiDriftTimer(Number.NaN, vi.fn())).toThrow(RangeError);
    expect(() => createAntiDriftTimer(Infinity, vi.fn())).toThrow(RangeError);
  });
});
