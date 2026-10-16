import { createElement, renderToDOM } from './mini-react.js';

// Build the application VNode tree.
const vApp = createElement(
  'main',
  {
    id: 'root-view',
    role: 'main',
  },
  createElement(
    'header',
    { className: 'hero' },
    createElement('h1', null, 'Mini React Engine'),
    createElement(
      'p',
      null,
      '<img onerror=alert(1)> Safe Text'
    )
  ),
  createElement(
    'section',
    { 'aria-label': 'Engine demonstration' },
    createElement(
      'p',
      null,
      'This interface is rendered from a VNode tree.'
    ),
    createElement(
      'button',
      {
        type: 'button',
        onClick: () => console.log('Ping'),
      },
      'Click'
    )
  )
);

// Mount the rendered DOM into #app.
const root = document.getElementById('app');

if (!root) {
  throw new Error('Mount failed: #app was not found.');
}

root.replaceChildren(renderToDOM(vApp));

console.log('Application mounted successfully.');