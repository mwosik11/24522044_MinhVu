
import {
  STATUS,
  createInitialState,
  transition,
} from './state-machine.js';

let passed = 0;
let failed = 0;

function test(name, callback) {
  try {
    callback();
    passed += 1;
    console.log(`PASS: ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL: ${name}`, error);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test 1: The initial state is IDLE.
test('creates the initial IDLE state', () => {
  const state = createInitialState();

  assert(state.status === STATUS.IDLE, 'Expected IDLE');
});

// Test 2: IDLE -> LOADING.
test('allows IDLE -> LOADING', () => {
  const next = transition(
    createInitialState(),
    { status: STATUS.LOADING }
  );

  assert(next.status === STATUS.LOADING, 'Expected LOADING');
});

// Test 3: LOADING -> SUCCESS.
test('allows LOADING -> SUCCESS', () => {
  const next = transition(
    { status: STATUS.LOADING },
    { status: STATUS.SUCCESS, data: [{ id: 1, title: 'Example' }] }
  );

  assert(next.status === STATUS.SUCCESS, 'Expected SUCCESS');
  assert(Array.isArray(next.data), 'Expected data array');
});

// Test 4: LOADING -> ERROR.
test('allows LOADING -> ERROR', () => {
  const next = transition(
    { status: STATUS.LOADING },
    { status: STATUS.ERROR, error: 'Network request failed.' }
  );

  assert(next.status === STATUS.ERROR, 'Expected ERROR');
});

// Test 5: Rejects invalid transitions.
test('rejects IDLE -> SUCCESS', () => {
  let threw = false;

  try {
    transition(
      createInitialState(),
      { status: STATUS.SUCCESS, data: [] }
    );
  } catch {
    threw = true;
  }

  assert(threw, 'Expected an invalid transition error');
});

// Test 6: Rejects ERROR without a message.
test('rejects an empty error message', () => {
  let threw = false;

  try {
    transition(
      { status: STATUS.LOADING },
      { status: STATUS.ERROR, error: '   ' }
    );
  } catch {
    threw = true;
  }

  assert(threw, 'Expected an invalid error payload');
});

console.log(`State machine tests: ${passed} passed, ${failed} failed.`);

test('allows LOADING -> LOADING for a new request', () => {
  const currentState = {
    status: STATUS.LOADING,
  };

  const next = transition(currentState, {
    status: STATUS.LOADING,
  });

  assert(
    next.status === STATUS.LOADING,
    'Expected LOADING after starting another request.'
  );
});
