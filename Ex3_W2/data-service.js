
const DATA_ENDPOINT =
  'https://jsonplaceholder.typicode.com/posts?_limit=5';
  //'https://jsonplaceholder.typicode.com/invalid-endpoint';

/**
 * Fetches feed data and validates the server response.
 * @param {AbortSignal} signal - Allows an active request to be cancelled.
 * @returns {Promise<Array<{id: number, title: string, body: string}>>}
 */
export async function fetchFeed(signal) {
  let response;

  try {
    response = await fetch(DATA_ENDPOINT, { signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new Error(
      'Unable to connect. Check your internet connection and try again.'
    );
  }

  if (!response.ok) {
    throw new Error(
      `The server returned an error (HTTP ${response.status}).`
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }

  const isValidData =
    Array.isArray(data) &&
    data.every(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        Number.isInteger(item.id) &&
        typeof item.title === 'string' &&
        typeof item.body === 'string'
    );

  if (!isValidData) {
    throw new Error(
      'The server returned data in an unexpected format.'
    );
  }

  return data;
}
