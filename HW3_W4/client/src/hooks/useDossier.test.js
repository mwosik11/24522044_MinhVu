import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useDossier } from './useDossier.js';

const json = (status, data) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

/** fetch that never resolves on its own and rejects with AbortError when aborted. */
function installControllableFetch() {
  const requests = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (url, { signal }) =>
        new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          requests.push({ url, signal, resolve });
        }),
    ),
  );
  return requests;
}

describe('useDossier', () => {
  it('aborts the previous request and never shows stale data when the player changes', async () => {
    const requests = installControllableFetch();
    const { result, rerender } = renderHook(({ id }) => useDossier(id), { initialProps: { id: 'himass' } });

    rerender({ id: 'tanvuu' });
    expect(requests[0].signal.aborted).toBe(true);
    expect(result.current).toMatchObject({ status: 'loading', data: null });

    await act(async () => requests[1].resolve(json(200, { player: { playerId: 'tanvuu' } })));
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.data.player.playerId).toBe('tanvuu');
  });

  it('maps a 404 to the not-found state', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => json(404, { error: 'No dossier for player "ghost"' })));
    const { result } = renderHook(() => useDossier('ghost'));
    await waitFor(() => expect(result.current.status).toBe('not-found'));
    expect(result.current.error).toMatch(/ghost/);
  });
});