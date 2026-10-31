
import { PUBG_VN_SQUADS } from '../data/pubg-vn-telemetry-spec.js';

/**
 * Simulate a KRAFTON PUBG VN telemetry request.
 *
 * @param {string} squadId
 * @param {{ signal: AbortSignal }} options
 * @returns {Promise<object>}
 */
export function fetchKraftonPubgTelemetry(
  squadId,
  { signal },
) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'));
      return;
    }

    const squad = PUBG_VN_SQUADS.find(
      (item) => item.id === squadId,
    );

    if (!squad) {
      reject(new Error(`Unknown squad ID: ${squadId}`));
      return;
    }

    const timeoutId = setTimeout(() => {
      signal.removeEventListener('abort', handleAbort);

      // Simulate 35% satellite packet loss.
      if (Math.random() < 0.35) {
        reject(new Error('Satellite packet timeout. Please reconnect.'));
        return;
      }

      resolve({ ...squad });
    }, 2500);

    function handleAbort() {
      clearTimeout(timeoutId);
      reject(new DOMException('Request aborted', 'AbortError'));
    }

    signal.addEventListener('abort', handleAbort, {
      once: true,
    });
  });
}
