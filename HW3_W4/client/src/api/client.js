/** Thin fetch wrapper. Every read accepts an AbortSignal so effects can cancel it. */

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details; // field errors from a 400 response
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(path, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? `Request failed (${response.status})`, data?.errors ?? null);
  }
  return data;
}

export const api = {
  getPlayers: (signal) => request('/api/players', { signal }),
  getDossier: (playerId, signal) => request(`/api/dossiers/${encodeURIComponent(playerId)}`, { signal }),
  fileAppeal: (playerId, appeal) =>
    request(`/api/dossiers/${encodeURIComponent(playerId)}/appeals`, { method: 'POST', body: appeal }),
};