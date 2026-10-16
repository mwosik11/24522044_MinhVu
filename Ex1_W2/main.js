import {
  createElement,
  renderToDOM,
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

// Test 1: Render a text VNode.
test('renders text nodes', () => {
  const vnode = createElement('p', null, 'Hello');
  const dom = renderToDOM(vnode);

  assert(dom.tagName === 'P', 'Expected a P element');
  assert(dom.textContent === 'Hello', 'Incorrect text content');
});

// Test 2: Render nested elements and attributes.
test('renders nested elements and attributes', () => {
  const vnode = createElement(
    'section',
    { id: 'content', className: 'panel' },
    createElement('h1', null, 'Title'),
    createElement('p', null, 'Description')
  );

  const dom = renderToDOM(vnode);

  assert(dom.id === 'content', 'Incorrect id');
  assert(dom.className === 'panel', 'Incorrect className');
  assert(dom.querySelector('h1')?.textContent === 'Title', 'Missing h1');
  assert(
    dom.querySelector('p')?.textContent === 'Description',
    'Missing paragraph'
  );
});

// Test 3: Register event listeners.
test('registers click handlers', () => {
  let clicked = false;

  const vnode = createElement(
    'button',
    { onClick: () => { clicked = true; } },
    'Click'
  );

  const dom = renderToDOM(vnode);
  dom.click();

  assert(clicked, 'Click handler was not called');
});

// Test 4: Treat HTML-like strings as text.
test('renders HTML-like content as plain text', () => {
  const payload = '<img onerror=alert(1)> Safe Text';
  const vnode = createElement('p', null, payload);
  const dom = renderToDOM(vnode);

  assert(dom.textContent === payload, 'Text content changed');
  assert(dom.querySelector('img') === null, 'Unexpected img element');
});

// Test 5: Reject raw HTML injection.
test('rejects dangerouslySetInnerHTML', () => {
  let didThrow = false;

  try {
    renderToDOM(
      createElement('p', {
        dangerouslySetInnerHTML: { __html: '<b>Unsafe</b>' },
      })
    );
  } catch {
    didThrow = true;
  }

  assert(didThrow, 'Expected raw HTML injection to be rejected');
});

// Test 6: Reject dangerous URL schemes.
test('rejects javascript URLs', () => {
  let didThrow = false;

  try {
    renderToDOM(
      createElement('a', { href: 'javascript:alert(1)' }, 'Link')
    );
  } catch {
    didThrow = true;
  }

  assert(didThrow, 'Expected javascript URL to be rejected');
});

// Test 7: Handle boolean DOM properties.
test('handles boolean DOM properties', () => {
  const dom = renderToDOM(
    createElement('button', { disabled: true }, 'Disabled')
  );

  assert(dom.disabled === true, 'Button should be disabled');
});

// Test 8: Reject invalid VNodes.
test('rejects invalid VNodes', () => {
  let didThrow = false;

  try {
    renderToDOM({ type: 'p', props: {} });
  } catch (error) {
    didThrow = error instanceof TypeError;
  }

  assert(didThrow, 'Expected invalid VNode to be rejected');
});

console.log(
  `Task 3 test results: ${passed} passed, ${failed} failed.`
);