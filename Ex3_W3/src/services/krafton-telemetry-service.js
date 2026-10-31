
/**
 * Fetch simulated KRAFTON PUBG VN telemetry.
 *
 * @param {string} squadId
 * @param {{ signal: AbortSignal }} options
 * @returns {Promise<object>}
 */
export async function fetchKraftonPubgTelemetry(
  squadId,
  { signal },
) {
  const response = await fetch(
    `/api/telemetry/${encodeURIComponent(squadId)}`,
    {
      method: 'GET',
      signal,
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(
      payload.message || 'Satellite telemetry request failed.',
    );
  }

  return payload;
}
