import { createElement, renderToDOM } from './mini-react.js';

const results = [];

function test(name, callback) {
  try {
    callback();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test 1: Script-like input remains plain text.
test('script payload is rendered as text', () => {
  const payload = '<script>alert(1)</script>';
  const dom = renderToDOM(createElement('p', null, payload));

  assert(dom.textContent === payload, 'Payload text was changed');
  assert(dom.querySelector('script') === null, 'A script element was created');
});

// Test 2: Image event-handler payload remains plain text.
test('img payload is rendered as text', () => {
  const payload = '<img onerror=alert(1)> Safe Text';
  const dom = renderToDOM(createElement('p', null, payload));

  assert(dom.textContent === payload, 'Payload text was changed');
  assert(dom.querySelector('img') === null, 'An img element was created');
});

// Test 3: Raw HTML injection is rejected.
test('dangerouslySetInnerHTML is rejected', () => {
  let didThrow = false;

  try {
    renderToDOM(
      createElement('p', {
        dangerouslySetInnerHTML: { __html: '<script>alert(1)</script>' },
      })
    );
  } catch {
    didThrow = true;
  }

  assert(didThrow, 'Raw HTML injection was not rejected');
});

// Test 4: Dangerous URL schemes are rejected.
test('javascript URL is rejected', () => {
  let didThrow = false;

  try {
    renderToDOM(
      createElement('a', { href: 'javascript:alert(1)' }, 'Link')
    );
  } catch {
    didThrow = true;
  }

  assert(didThrow, 'Dangerous URL was not rejected');
});

// Test 5: Event handler is registered without inline attributes.
test('click handler uses addEventListener', () => {
  let clicked = false;

  const dom = renderToDOM(
    createElement('button', {
      onClick: () => {
        clicked = true;
      },
    }, 'Test')
  );

  assert(!dom.hasAttribute('onclick'), 'Inline onclick attribute exists');

  dom.click();

  assert(clicked, 'Click event handler did not run');
});

// Test 6: No executable elements are created from payloads.
test('payloads do not create script or img elements', () => {
  const dom = renderToDOM(
    createElement(
      'section',
      null,
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>'
    )
  );

  assert(dom.querySelectorAll('script, img').length === 0,
    'Unexpected script or img element found');
});

const passed = results.filter((result) => result.passed).length;
const failed = results.length - passed;

results.forEach((result) => {
  if (result.passed) {
    console.log(`PASS: ${result.name}`);
  } else {
    console.error(`FAIL: ${result.name} — ${result.error}`);
  }
});

console.log(`Security tests: ${passed} passed, ${failed} failed.`);

// Display a visible summary on the test page.
const report = document.getElementById('test-results');

if (report) {
  report.replaceChildren();

  results.forEach((result) => {
    const item = document.createElement('li');
    item.textContent = `${result.passed ? 'PASS' : 'FAIL'}: ${result.name}`;
    report.appendChild(item);
  });

  const summary = document.createElement('p');
  summary.textContent = `Security tests: ${passed} passed, ${failed} failed.`;
  report.appendChild(summary);
}