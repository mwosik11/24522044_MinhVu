import { useEffect, useState } from 'react';

/**
 * @typedef {{ id: string, author: string, text: string, timestamp: string }} Message
 * @typedef {'LOADING' | 'SUCCESS' | 'ERROR'} FetchStatus
 */

const API_BASE = '/api/messages';

/** Đọc thông điệp lỗi JSON { error } từ server; fallback về HTTP status */
async function readError(res) {
  try {
    const body = await res.json();
    return body.error ?? `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

/**
 * Full-stack hook: tải message của 1 forum, hủy request cũ khi đổi kênh.
 * Mỗi request gắn "key" = forumId#reloadTick; kết quả chỉ được dùng khi key khớp
 * request hiện tại → không bao giờ hiển thị dữ liệu của kênh cũ.
 * @param {string} forumId
 */
export function useForumMessages(forumId) {
  const [reloadTick, setReloadTick] = useState(0);
  const [result, setResult] = useState({ key: null, forumId: null, status: 'LOADING', data: [], error: null });
  const requestKey = `${forumId}#${reloadTick}`;

  useEffect(() => {
    const controller = new AbortController();
    const key = `${forumId}#${reloadTick}`;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(forumId)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(await readError(res));
        const data = await res.json();
        if (!controller.signal.aborted) {
          setResult({ key, forumId, status: 'SUCCESS', data, error: null });
        }
      } catch (err) {
        // AbortError do chính cleanup gây ra → bỏ qua, KHÔNG set state
        if (controller.signal.aborted) return;
        setResult({ key, forumId, status: 'ERROR', data: [], error: err.message });
      }
    };

    fetchMessages();
    return () => controller.abort();
  }, [forumId, reloadTick]);

  const isCurrent = result.key === requestKey;
  /** @type {FetchStatus} */
  const status = isCurrent ? result.status : 'LOADING';
  // Khi refetch CÙNG kênh (sau POST) vẫn giữ list cũ để tránh nhấp nháy
  const data = isCurrent || result.forumId === forumId ? result.data : [];

  const retry = () => setReloadTick((t) => t + 1);

  /**
   * POST message mới rồi refetch. Ném Error (kèm .fields nếu 400) để UI hiển thị.
   * @param {{ author: string, text: string }} payload
   * @returns {Promise<Message>}
   */
  const postMessage = async (payload) => {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(forumId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const error = new Error(body.error ?? `HTTP ${res.status}`);
      error.fields = body.fields ?? {};
      throw error;
    }
    const created = await res.json();
    retry();
    return created;
  };

  return { status, loading: status === 'LOADING', data, error: isCurrent ? result.error : null, retry, postMessage };
}