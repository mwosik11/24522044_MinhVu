
import {
  stateStore,
  resetCursor,
  useState,
  setRerenderCallback,
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

// Isolate this test runner from earlier test state.
stateStore.length = 0;
resetCursor();

test('useState initializes a value', () => {
  const [count] = useState(0);
  assert(count === 0, 'Initial state should be 0');
});

test('useState preserves state across renders', () => {
  resetCursor();
  const [count] = useState(0);
  assert(count === 0, 'State should persist at index 0');
});

test('useState updates a value', () => {
  resetCursor();
  const [count, setCount] = useState(0);

  setCount(5);

  assert(stateStore[0] === 5, 'State should become 5');
  assert(count === 0, 'Current render value should remain a snapshot');
});

test('useState supports functional updates', () => {
  resetCursor();
  const [, setCount] = useState(5);

  setCount((previous) => previous + 1);

  assert(stateStore[0] === 6, 'State should become 6');
});

test('multiple hooks use separate state slots', () => {
  resetCursor();

  const [count] = useState(6);
  const [label, setLabel] = useState('Tasks');

  setLabel('My Tasks');

  assert(count === 6, 'First state slot changed unexpectedly');
  assert(stateStore[1] === 'My Tasks', 'Second slot did not update');
});

test('state update triggers the registered callback', () => {
  let renderCount = 0;

  setRerenderCallback(() => {
    renderCount += 1;
  });

  resetCursor();
  const [, setValue] = useState('before');

  setValue('after');

  assert(renderCount === 1, 'Render callback should run once');

  setRerenderCallback(() => {});
});

console.log(`Task 2 results: ${passed} passed, ${failed} failed.`);
