import { createTextElement } from './mini-react.js';

const textVNode = createTextElement('Mini React Engine');
const numberVNode = createTextElement(123);

console.assert(
  textVNode.type === 'TEXT_ELEMENT',
  'FAIL: Incorrect text node type'
);

console.assert(
  textVNode.props.nodeValue === 'Mini React Engine',
  'FAIL: Incorrect text content'
);

console.assert(
  numberVNode.props.nodeValue === '123',
  'FAIL: Number was not converted to string'
);

console.assert(
  Array.isArray(textVNode.props.children) &&
    textVNode.props.children.length === 0,
  'FAIL: Text node children should be an empty array'
);

console.log('Text VNode:', textVNode);
console.log('Number VNode:', numberVNode);
console.log('Task 1 tests completed.');