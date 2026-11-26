/** Thin fetch wrapper. Every call accepts an AbortSignal so effects can cancel it. */

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(path, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export const api = {
  getProfiles: (signal) => request('/api/profiles', { signal }),
  getSwipes: (sessionId, signal) =>
    request(`/api/swipes?sessionId=${encodeURIComponent(sessionId)}`, { signal }),
  postSwipe: (swipe) => request('/api/swipe', { method: 'POST', body: swipe }),
  deleteSwipe: (clientId, sessionId) =>
    request(`/api/swipe/${encodeURIComponent(clientId)}?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
    }),
};