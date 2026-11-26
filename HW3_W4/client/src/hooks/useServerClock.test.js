import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { computeClockOffset, useServerClock } from './useServerClock.js';

const json = (status, data) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

describe('computeClockOffset', () => {
  it('compensates for half of the round-trip time', () => {
    // sent at 1000, server says 6000, received at 1200 → server time at midpoint (1100) was 6000
    expect(computeClockOffset(1000, 6000, 1200)).toBe(4900);
  });
});

describe('useServerClock', () => {
  it('measures the offset against GET /api/time and can resync', async () => {
    const fetchMock = vi.fn(async () => json(200, { now: Date.now() + 60_000 }));
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useServerClock());
    await waitFor(() => expect(result.current.status).toBe('synced'));
    expect(Math.abs(result.current.offsetMs - 60_000)).toBeLessThan(1000);
    expect(fetchMock).toHaveBeenCalledWith('/api/time', expect.objectContaining({ cache: 'no-store' }));

    act(() => result.current.resync());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('falls back to the local clock (offset 0) when the server is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(500, { error: 'down' })));
    const { result } = renderHook(() => useServerClock());
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.offsetMs).toBe(0);
  });
});