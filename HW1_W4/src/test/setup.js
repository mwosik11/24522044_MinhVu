import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// jsdom only partially implements HTMLDialogElement. Replace showModal()/close()
// with the minimal spec behaviour our components rely on:
//  - showModal() on an already-open dialog throws InvalidStateError (like browsers)
//  - close() removes `open` and dispatches a `close` event
const proto = globalThis.HTMLDialogElement?.prototype;
if (proto) {
  proto.showModal = function showModal() {
    if (this.open) throw new DOMException('Dialog already open', 'InvalidStateError');
    this.setAttribute('open', '');
  };
  proto.close = function close() {
    if (!this.open) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}