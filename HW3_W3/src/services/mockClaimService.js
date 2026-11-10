
/**
 * HW3 – Simulated PUBG claim service.
 *
 * No real backend or payment processing is involved.
 */

const DEMO_CONFLICT_DROP_ID = "pvs-contraband-crate";

/**
 * Simulate a server-side claim request.
 *
 * @param {string} dropId
 * @param {{ signal?: AbortSignal }} options
 * @returns {Promise<{ok: boolean, status: number, message?: string}>}
 */
export function claimDrop(dropId, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const error = new Error("Claim request was aborted.");
      error.name = "AbortError";
      reject(error);
      return;
    }

    const handleAbort = () => {
      window.clearTimeout(timeoutId);

      const error = new Error("Claim request was aborted.");
      error.name = "AbortError";

      reject(error);
    };

    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);

      if (dropId === DEMO_CONFLICT_DROP_ID) {
        resolve({
          ok: false,
          status: 409,
          message:
            "The item is no longer available. Inventory was restored.",
        });
        return;
      }

      resolve({
        ok: true,
        status: 200,
        message: "Claim completed successfully.",
      });
    }, 700);

    signal?.addEventListener("abort", handleAbort, {
      once: true,
    });
  });
}
