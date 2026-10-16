# Exercise 1 — Mini-React VNode & Mounting Engine

## Project Goal
Implement a minimal Virtual DOM engine from scratch using Vanilla JavaScript.

## Task Checklist

### Task 0 — Project Setup
- [ ] 0.1 Inspect the existing `Ex1_W2` directory.
- [ ] 0.2 Create the required project files.
- [ ] 0.3 Configure `index.html` to load JavaScript modules.
- [ ] 0.4 Create the initial Git checkpoint.

### Task 1 — Implement `createTextElement()`
- [ ] 1.1 Define the expected TEXT_ELEMENT VNode structure.
- [ ] 1.2 Convert string and number values to text VNodes.
- [ ] 1.3 Verify `nodeValue` is stored as a string.
- [ ] 1.4 Test the returned VNode structure.

### Task 2 — Implement `createElement()`
- [ ] 2.1 Define the VNode structure: `type`, `props`, and `children`.
- [ ] 2.2 Handle `null` or missing props safely.
- [ ] 2.3 Support variadic children and nested arrays.
- [ ] 2.4 Filter `null`, `undefined`, and `false` children.
- [ ] 2.5 Normalize primitive children using `createTextElement()`.
- [ ] 2.6 Test nested VNode structures.
- [ ] 2.7 Commit: `feat(core): implement createElement factory`

### Task 3 — Implement `renderToDOM()`
- [ ] 3.1 Handle `TEXT_ELEMENT` using `document.createTextNode()`.
- [ ] 3.2 Create semantic HTML elements using `document.createElement()`.
- [ ] 3.3 Assign supported DOM properties safely.
- [ ] 3.4 Register event handlers using `addEventListener()`.
- [ ] 3.5 Recursively render and append child nodes.
- [ ] 3.6 Test the resulting DOM structure.
- [ ] 3.7 Commit: `feat(core): implement renderToDOM`

### Task 4 — Mount the Application
- [ ] 4.1 Build the sample VNode tree from the lecture slide.
- [ ] 4.2 Mount the VNode into `#app`.
- [ ] 4.3 Use semantic HTML; avoid unnecessary `<div>` elements.
- [ ] 4.4 Verify that the expected button exists.

### Task 5 — Security Verification
- [ ] 5.1 Render `<script>alert(1)</script>` as plain text.
- [ ] 5.2 Render `<img onerror=alert(1)> Safe Text` as plain text.
- [ ] 5.3 Confirm that injected strings do not create executable DOM elements.
- [ ] 5.4 Verify event handling does not rely on inline HTML handlers.

### Task 6 — DevTools Audit
- [ ] 6.1 Inspect the Elements panel.
- [ ] 6.2 Compare the real DOM with the expected VNode tree.
- [ ] 6.3 Check for unexpected or orphaned DOM nodes.
- [ ] 6.4 Verify the button click handler.
- [ ] 6.5 Capture screenshots of successful tests.

### Task 7 — Final Review
- [ ] 7.1 Review code against the lecture requirements.
- [ ] 7.2 Review Git history and commit messages.
- [ ] 7.3 Confirm all required tests pass.
- [ ] 7.4 Record any limitations or known issues.

## Working Rules
1. Complete one task at a time.
2. Define the expected behavior before implementation.
3. Test each function independently.
4. Do not use `var` or raw `innerHTML` injection.
5. Do not mark a task complete until it has been verified.
6. Update this checklist after each completed task.
