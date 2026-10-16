
import { STATUS } from './state-machine.js';
import { createDataLoader } from './data-loader.js';

const sampleData = [
  {
    id: 1,
    title: 'Test post',
    body: 'Test content',
  },
];

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function test(name, callback) {
  try {
    await callback();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (error) {
    failed++;
    console.error(`FAIL: ${name}`, error);
  }
}

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

async function runTests() {
  // Test 1: Successful data loading.
  await test('loads data and enters SUCCESS', async () => {
    const loader = createDataLoader(
      () => {},
      async () => sampleData
    );

    await loader.load();

    const state = loader.getState();

    assert(state.status === STATUS.SUCCESS, 'Expected SUCCESS.');
    assert(state.data === sampleData, 'Expected returned data.');

    loader.dispose();
  });

  // Test 2: Failed data loading.
  await test('handles errors and enters ERROR', async () => {
    const loader = createDataLoader(
      () => {},
      async () => {
        throw new Error('Connection failed.');
      }
    );

    await loader.load();

    const state = loader.getState();

    assert(state.status === STATUS.ERROR, 'Expected ERROR.');
    assert(
      state.error === 'Connection failed.',
      'Expected the error message to be preserved.'
    );

    loader.dispose();
  });

  // Test 3: An outdated request must not overwrite newer data.
  await test('ignores stale responses', async () => {
    const firstRequest = createDeferred();
    const secondRequest = createDeferred();
    let callCount = 0;

    const loader = createDataLoader(
      () => {},
      () => {
        callCount++;

        return callCount === 1
          ? firstRequest.promise
          : secondRequest.promise;
      }
    );

    const firstLoad = loader.load();
    const secondLoad = loader.load();

    const latestData = [
      {
        id: 2,
        title: 'Latest post',
        body: 'Latest content',
      },
    ];

    secondRequest.resolve(latestData);
    await secondLoad;

    assert(
      loader.getState().status === STATUS.SUCCESS,
      'Expected SUCCESS after the latest request.'
    );

    assert(
      loader.getState().data === latestData,
      'Expected data from the latest request.'
    );

    // Simulate the older request finishing after the newer one.
    firstRequest.resolve(sampleData);
    await firstLoad;

    assert(
      loader.getState().data === latestData,
      'The stale response must not overwrite newer data.'
    );

    loader.dispose();
  });

  console.log(
    `Data loader tests: ${passed} passed, ${failed} failed.`
  );
}

runTests();
