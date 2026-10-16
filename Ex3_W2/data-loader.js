
import {
  STATUS,
  createInitialState,
  transition,
} from './state-machine.js';

import { fetchFeed } from './data-service.js';

/**
 * Creates a loader for asynchronous data.
 *
 * @param {(state: object) => void} onStateChange
 * @param {(signal: AbortSignal) => Promise<Array>} fetchData
 */
export function createDataLoader(
  onStateChange,
  fetchData = fetchFeed
) {
  if (typeof onStateChange !== 'function') {
    throw new TypeError('onStateChange must be a function.');
  }

  if (typeof fetchData !== 'function') {
    throw new TypeError('fetchData must be a function.');
  }

  let currentState = createInitialState();
  let activeController = null;
  let requestId = 0;
  let disposed = false;

  function updateState(nextState) {
    currentState = transition(currentState, nextState);
    onStateChange(currentState);
  }

  async function load() {
    if (disposed) {
      throw new Error(
        'Cannot load data after the loader has been disposed.'
      );
    }

    const currentRequestId = ++requestId;

    // Cancel the previous request if it is still active.
    activeController?.abort();

    const controller = new AbortController();
    activeController = controller;

    updateState({
      status: STATUS.LOADING,
    });

    try {
      const data = await fetchData(controller.signal);

      // Ignore results from outdated or disposed requests.
      if (
        disposed ||
        currentRequestId !== requestId
      ) {
        return;
      }

      updateState({
        status: STATUS.SUCCESS,
        data,
      });
    } catch (error) {
      // Ignore cancellation and outdated request errors.
      if (
        disposed ||
        currentRequestId !== requestId ||
        error?.name === 'AbortError'
      ) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred. Please try again.';

      updateState({
        status: STATUS.ERROR,
        error: message,
      });
    } finally {
      // Do not clear a newer request's controller.
      if (currentRequestId === requestId) {
        activeController = null;
      }
    }
  }

  function dispose() {
    if (disposed) {
      return;
    }

    disposed = true;
    requestId += 1;

    activeController?.abort();
    activeController = null;
  }

  return {
    load,
    getState: () => currentState,
    dispose,
  };
}
