
import {
  createElement,
  renderToDOM,
} from './reactive-engine.js';

import {
  setupEventDelegation,
} from './event-delegation.js';

const root = document.getElementById('test-root');

if (!root) {
  throw new Error('Test root not found.');
}

setupEventDelegation(root);

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

// Test 1: Click delegation.
let clickCount = 0;

const clickVNode = createElement(
  'button',
  {
    onClick: () => {
      clickCount += 1;
    },
  },
  'Click'
);

const clickButton = renderToDOM(clickVNode);
root.appendChild(clickButton);
clickButton.click();

test('delegates click events to the root', () => {
  assert(clickCount === 1, 'Click handler should run once');
  assert(
    !clickButton.hasAttribute('onclick'),
    'Inline onclick attribute must not exist'
  );
});

// Test 2: Input delegation.
let inputValue = '';

const inputVNode = createElement('input', {
  onInput: (event) => {
    inputValue = event.target.value;
  },
});

const input = renderToDOM(inputVNode);
root.appendChild(input);

input.value = 'Task';
input.dispatchEvent(
  new Event('input', { bubbles: true })
);

test('delegates input events to the root', () => {
  assert(
    inputValue === 'Task',
    'Input handler did not receive the value'
  );
});

// Test 3: Keyboard delegation.
let pressedKey = '';

const keyVNode = createElement('input', {
  onKeydown: (event) => {
    pressedKey = event.key;
  },
});

const keyInput = renderToDOM(keyVNode);
root.appendChild(keyInput);

keyInput.dispatchEvent(
  new KeyboardEvent('keydown', {
    key: 'Enter',
    bubbles: true,
  })
);

test('delegates keydown events to the root', () => {
  assert(
    pressedKey === 'Enter',
    'Keydown handler did not run'
  );
});

// Test 4: The closest matching handler is invoked.
let parentCount = 0;
let childCount = 0;

const nestedVNode = createElement(
  'section',
  {
    onClick: () => {
      parentCount += 1;
    },
  },
  createElement(
    'button',
    {
      onClick: () => {
        childCount += 1;
      },
    },
    'Nested'
  )
);

const nestedDOM = renderToDOM(nestedVNode);
root.appendChild(nestedDOM);

nestedDOM.querySelector('button').click();

test('uses the closest matching VNode handler', () => {
  assert(childCount === 1, 'Child handler should run once');
  assert(
    parentCount === 0,
    'Parent handler should not run in this version'
  );
});

console.log(
  `Task 3 results: ${passed} passed, ${failed} failed.`
);
