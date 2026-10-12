# HW2 — Drum Kit Engine

## 1. Project Objective

Build a Drum Kit Engine using Vanilla HTML5, modern CSS, and Vanilla JavaScript ES6+. The application must support keyboard-triggered audio playback and timestamped beat recording.

## 2. Architectural Constraints

- Use semantic HTML5 and native browser APIs.
- Use Vanilla JavaScript ES6+; no external JavaScript libraries.
- Define the HTML data contract before implementing JavaScript.
- Keep the audio engine independent of UI event handlers.
- Use `keydown` and `event.key`; do not use deprecated `keypress` or `event.keyCode`.
- Use `event.repeat` to prevent repeated playback when a key is held.
- Keep Git commits atomic and focused on one task.
- Inspect Git diffs and verify each subsystem before integration.

## 3. Work Breakdown Structure

| Task ID | Task | Scope | Verification |
|---|---|---|---|
| T-01 | Project specification | Define architecture, contracts, tasks, and commit plan | Review this document |
| T-02 | HTML data contract | Define drum pads and `data-sound` attributes | Inspect HTML attributes and sound mappings |
| T-03 | Audio engine | Implement independent polyphonic audio playback | Trigger multiple sounds in quick succession |
| T-04 | Keyboard handling | Implement `keydown`, key mapping, and `event.repeat` handling | Test mapped keys and held keys |
| T-05 | Beat Recorder | Record events in FIFO order with timestamps | Verify event order and timestamps |
| T-06 | Integration and quality assurance | Integrate subsystems and test functionality, accessibility, responsiveness, and errors | Run the test checklist |

## 4. Contract-First Design

### HTML-to-Audio Contract
- Each playable drum pad exposes its sound source through `data-sound`.
- Each playable pad has a defined keyboard mapping.
- JavaScript reads the contract from HTML rather than relying on a large hardcoded switch statement.
- The exact attribute names and keyboard mapping must remain consistent across HTML and JavaScript.

### Audio Engine Contract
- Audio playback logic is independent of keyboard and mouse event handlers.
- The engine supports overlapping playback of different sounds.
- Invalid or missing sound sources must not cause uncaught errors.

### Keyboard Contract
- Use the standard `keydown` event and `event.key`.
- Ignore repeated keydown events when `event.repeat` is true.
- Keyboard mappings must be easy to modify during the live defense.

### Beat Recorder Contract
- Record each accepted playback event in FIFO order.
- Each record includes a timestamp and enough information to identify the triggered sound.
- Recording must not block audio playback.

## 5. Planned Atomic Commits

1. `docs(spec): define component contracts & WBS`
2. `feat(html): build semantic drum pad contract`
3. `feat(css): implement responsive drum pad layout`
4. `feat(js): implement decoupled audio engine`
5. `feat(js): bind keydown events with repeat throttling`
6. `feat(js): implement timestamped FIFO beat recorder`

## 6. Verification Checklist

- [ ] HTML contract is committed before JavaScript implementation.
- [ ] Audio engine supports overlapping playback.
- [ ] Keyboard handling uses `keydown`, `event.key`, and `event.repeat`.
- [ ] Beat Recorder preserves FIFO order and records timestamps.
- [ ] Mouse and keyboard interaction both work.
- [ ] Layout works at a 375px viewport without horizontal overflow.
- [ ] No uncaught console errors during normal interaction.
- [ ] Git diff contains only the intended changes for each task.
- [ ] All required commits are present and pushed to GitHub.

## 7. Live Defense Preparation

Practice changing a keyboard mapping by modifying the relevant contract and verifying that the engine continues to work without unnecessary refactoring.
