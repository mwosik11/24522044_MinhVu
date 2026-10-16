import {
  stateStore,
  resetCursor,
  getNextStateIndex,
} from './reactive-engine.js';

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

// Test 1: State store starts empty.
test('stateStore is an array', () => {
  assert(Array.isArray(stateStore), 'stateStore must be an array');
  assert(stateStore.length === 0, 'stateStore should start empty');
});

// Test 2: Cursor returns sequential indexes.
test('cursor returns sequential indexes', () => {
  resetCursor();

  assert(getNextStateIndex() === 0, 'First index must be 0');
  assert(getNextStateIndex() === 1, 'Second index must be 1');
  assert(getNextStateIndex() === 2, 'Third index must be 2');
});

// Test 3: Resetting the cursor starts from zero again.
test('resetCursor resets the index', () => {
  getNextStateIndex();
  resetCursor();

  assert(getNextStateIndex() === 0, 'Cursor should reset to 0');
});

// Test 4: Stored values persist when cursor resets.
test('state values persist across cursor resets', () => {
  stateStore.length = 0;
  stateStore.push(10, 'Task Manager');

  resetCursor();
  getNextStateIndex();
  resetCursor();

  assert(stateStore[0] === 10, 'First state value was lost');
  assert(
    stateStore[1] === 'Task Manager',
    'Second state value was lost'
  );

  stateStore.length = 0;
  resetCursor();
});

console.log(`Task 1 results: ${passed} passed, ${failed} failed.`);