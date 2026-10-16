import {
  createTextElement,
  createElement,
} from './mini-react.js';

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

// Test 1: Text VNode from Task 1.
test('createTextElement converts numbers to strings', () => {
  const vnode = createTextElement(123);

  assert(vnode.type === 'TEXT_ELEMENT', 'Incorrect type');
  assert(vnode.props.nodeValue === '123', 'Incorrect nodeValue');
  assert(Array.isArray(vnode.props.children), 'Children must be an array');
  assert(vnode.props.children.length === 0, 'Text node must have no children');
});

// Test 2: Basic element and props.
test('createElement creates an element VNode', () => {
  const vnode = createElement('section', { id: 'content' }, 'Hello');

  assert(vnode.type === 'section', 'Incorrect element type');
  assert(vnode.props.id === 'content', 'Props were not preserved');
  assert(vnode.props.children.length === 1, 'Expected one child');
  assert(
    vnode.props.children[0].props.nodeValue === 'Hello',
    'Text child was not normalized'
  );
});

// Test 3: Missing props.
test('createElement supports null props', () => {
  const vnode = createElement('h1', null, 'Title');

  assert(vnode.type === 'h1', 'Incorrect element type');
  assert(vnode.props.children.length === 1, 'Expected one child');
});

// Test 4: Nested arrays and multiple children.
test('createElement flattens nested child arrays', () => {
  const vnode = createElement(
    'main',
    {},
    ['A', ['B', 3]]
  );

  const children = vnode.props.children;

  assert(children.length === 3, 'Expected three children');
  assert(children[0].props.nodeValue === 'A', 'Incorrect first child');
  assert(children[1].props.nodeValue === 'B', 'Incorrect second child');
  assert(children[2].props.nodeValue === '3', 'Incorrect third child');
});

// Test 5: Filter null, undefined and false.
test('createElement filters empty children', () => {
  const vnode = createElement(
    'section',
    null,
    'A',
    null,
    undefined,
    false,
    'B'
  );

  assert(vnode.props.children.length === 2, 'Unexpected child count');
});

// Test 6: Preserve nested VNodes.
test('createElement preserves existing child VNodes', () => {
  const button = createElement('button', { type: 'button' }, 'Click');
  const section = createElement('section', null, button);

  assert(
    section.props.children[0] === button,
    'Existing VNode should be preserved'
  );
});

// Test 7: Reject invalid child values.
test('createElement rejects invalid child objects', () => {
  let didThrow = false;

  try {
    createElement('section', null, { invalid: true });
  } catch (error) {
    didThrow = error instanceof TypeError;
  }

  assert(didThrow, 'Expected TypeError for an invalid child');
});

// Test 8: Reject invalid element types.
test('createElement rejects invalid element types', () => {
  let didThrow = false;

  try {
    createElement('', null, 'Hello');
  } catch (error) {
    didThrow = error instanceof TypeError;
  }

  assert(didThrow, 'Expected TypeError for an invalid type');
});

console.log(`Task 2 test results: ${passed} passed, ${failed} failed.`);