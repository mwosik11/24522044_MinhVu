import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useForumMessages } from '../useForumMessages.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** fetch giả: trả về promise do test tự resolve, tôn trọng AbortSignal như fetch thật */
function createControllableFetch() {
  const calls = [];
  const fetchMock = vi.fn((url, init = {}) => {
    let resolve;
    const promise = new Promise((res, rej) => {
      resolve = res;
      init.signal?.addEventListener('abort', () => rej(new DOMException('Aborted', 'AbortError')));
    });
    calls.push({ url, init, resolve });
    return promise;
  });
  return { fetchMock, calls };
}

let ctl;
beforeEach(() => {
  ctl = createControllableFetch();
  vi.stubGlobal('fetch', ctl.fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('useForumMessages', () => {
  it('starts in LOADING then exposes data on SUCCESS', async () => {
    const { result } = renderHook(() => useForumMessages('nasa'));
    expect(result.current.status).toBe('LOADING');
    expect(ctl.calls[0].url).toBe('/api/messages/nasa');

    await act(async () => ctl.calls[0].resolve(json([{ id: '1', author: 'A', text: 'hi', timestamp: '2026-01-01' }])));
    expect(result.current.status).toBe('SUCCESS');
    expect(result.current.data).toHaveLength(1);
  });

  it('aborts the in-flight request when the channel changes and ignores its late response', async () => {
    const { result, rerender } = renderHook(({ id }) => useForumMessages(id), { initialProps: { id: 'nasa' } });
    rerender({ id: 'esports-tribunal' });

    expect(ctl.calls[0].init.signal.aborted).toBe(true);   // request 'nasa' bị huỷ
    expect(ctl.calls[1].init.signal.aborted).toBe(false);

    await act(async () => ctl.calls[1].resolve(json([{ id: 'e1', author: 'Ref', text: 'tribunal', timestamp: '2026-01-01' }])));
    expect(result.current.data[0].text).toBe('tribunal');
    expect(result.current.status).toBe('SUCCESS');
  });

  it('aborts on unmount (no state update after unmount)', () => {
    const { unmount } = renderHook(() => useForumMessages('nasa'));
    unmount();
    expect(ctl.calls[0].init.signal.aborted).toBe(true);
  });

  it('moves to ERROR with the server message when res.ok is false', async () => {
    const { result } = renderHook(() => useForumMessages('notNasa'));
    await act(async () => ctl.calls[0].resolve(json({ error: "Forum 'notNasa' not found" }, 404)));
    expect(result.current.status).toBe('ERROR');
    expect(result.current.error).toBe("Forum 'notNasa' not found");
  });

  it('retry() issues a fresh request', async () => {
    const { result } = renderHook(() => useForumMessages('notNasa'));
    await act(async () => ctl.calls[0].resolve(json({ error: 'boom' }, 500)));
    act(() => result.current.retry());
    expect(ctl.calls).toHaveLength(2);
    expect(result.current.status).toBe('LOADING');
  });

  it('postMessage() sends JSON then refetches', async () => {
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => ctl.calls[0].resolve(json([])));

    let postPromise;
    act(() => { postPromise = result.current.postMessage({ author: 'Minh', text: 'Hello' }); });
    expect(ctl.calls[1].init.method).toBe('POST');
    expect(JSON.parse(ctl.calls[1].init.body)).toEqual({ author: 'Minh', text: 'Hello' });

    await act(async () => {
      ctl.calls[1].resolve(json({ id: 'n1', author: 'Minh', text: 'Hello', timestamp: '2026-01-01' }, 201));
      await postPromise;
    });
    await waitFor(() => expect(ctl.calls).toHaveLength(3)); // refetch GET
    expect(ctl.calls[2].init.method).toBeUndefined();
  });

  it('postMessage() rejects with field errors on 400', async () => {
    const { result } = renderHook(() => useForumMessages('nasa'));
    await act(async () => ctl.calls[0].resolve(json([])));

    let caught;
    await act(async () => {
      const p = result.current.postMessage({ author: 'M', text: '' }).catch((e) => { caught = e; });
      ctl.calls[1].resolve(json({ error: 'Invalid message payload', fields: { text: 'text is required' } }, 400));
      await p;
    });
    expect(caught.message).toBe('Invalid message payload');
    expect(caught.fields).toEqual({ text: 'text is required' });
  });
});