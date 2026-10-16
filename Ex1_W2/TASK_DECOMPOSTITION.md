# Exercise 1 — Mini-React VNode & Mounting Engine

## Project Goal
Implement a minimal Virtual DOM engine from scratch using Vanilla JavaScript.

## Task Checklist

### Task 0 — Project Setup
- [x] 0.1 Inspect the existing `Ex1_W2` directory.
- [x] 0.2 Create the required project files.
- [x] 0.3 Configure `index.html` to load JavaScript modules.
- [x] 0.4 Create the initial Git checkpoint.

### Task 1 — Implement `createTextElement()`
- [x] 1.1 Define the expected TEXT_ELEMENT VNode structure.
- [x] 1.2 Convert string and number values to text VNodes.
- [x] 1.3 Verify `nodeValue` is stored as a string.
- [x] 1.4 Test the returned VNode structure.

### Task 2 — Implement `createElement()`
- [x] 2.1 Define the VNode structure: `type`, `props`, and `children`.
- [x] 2.2 Handle `null` or missing props safely.
- [x] 2.3 Support variadic children and nested arrays.
- [x] 2.4 Filter `null`, `undefined`, and `false` children.
- [x] 2.5 Normalize primitive children using `createTextElement()`.
- [x] 2.6 Test nested VNode structures.
- [x] 2.7 Commit: `feat(core): implement createElement factory`

### Task 3 — Implement `renderToDOM()`
- [x] 3.1 Handle `TEXT_ELEMENT` using `document.createTextNode()`.
- [x] 3.2 Create semantic HTML elements using `document.createElement()`.
- [x] 3.3 Assign supported DOM properties safely.
- [x] 3.4 Register event handlers using `addEventListener()`.
- [x] 3.5 Recursively render and append child nodes.
- [x] 3.6 Test the resulting DOM structure.
- [x] 3.7 Commit: `feat(core): implement renderToDOM`

### Task 4 — Mount the Application
- [x] 4.1 Build the sample VNode tree from the lecture slide.
- [x] 4.2 Mount the VNode into `#app`.
- [x] 4.3 Use semantic HTML; avoid unnecessary `<div>` elements.
- [x] 4.4 Verify that the expected button exists.

### Task 5 — Security Verification
- [x] 5.1 Render `<script>alert(1)</script>` as plain text.
- [x] 5.2 Render `<img onerror=alert(1)> Safe Text` as plain text.
- [x] 5.3 Confirm that injected strings do not create executable DOM elements.
- [x] 5.4 Verify event handling does not rely on inline HTML handlers.

### Task 6 — DevTools Audit
- [x] 6.1 Inspect the Elements panel.
- [x] 6.2 Compare the real DOM with the expected VNode tree.
- [x] 6.3 Check for unexpected or orphaned DOM nodes.
- [x] 6.4 Verify the button click handler.
- [x] 6.5 Capture screenshots of successful tests.

### Task 7 — Final Review
- [x] 7.1 Review code against the lecture requirements.
- [x] 7.2 Review Git history and commit messages.
- [x] 7.3 Confirm all required tests pass.
- [x] 7.4 Record any limitations or known issues.

## Working Rules
1. Complete one task at a time.
2. Define the expected behavior before implementation.
3. Test each function independently.
4. Do not use `var` or raw `innerHTML` injection.
5. Do not mark a task complete until it has been verified.
6. Update this checklist after each completed task.
