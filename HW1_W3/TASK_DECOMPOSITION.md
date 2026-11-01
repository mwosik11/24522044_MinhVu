# TASK DECOMPOSITION — HW1: Production Studio Drum Kit

## 1. Project Objective

Build a production-style drum machine using React 19 and Web Audio.

The application must provide seven interactive drum pads, physical keyboard support, visual feedback, an accessible hit log, and a visual decibel meter.

## 2. Functional Requirements

- Seven drum pads mapped to W, A, S, D, J, K, and L.
- Mouse and physical keyboard interaction.
- Keyboard events handled through `keydown` and `keyup`.
- Use `event.code` instead of deprecated `keyCode`.
- Ignore repeated keyboard events using `event.repeat`.
- Ignore keyboard shortcuts while typing in INPUT, TEXTAREA, and SELECT elements.
- Accessible hit log using `<output aria-live="polite">`.
- Visual decibel meter.
- Pad buttons expose their activation state through `aria-pressed`.
- Proper event listener and audio resource cleanup.

## 3. Task Breakdown

### Phase 1 — Project Planning and Data Design

- [x] Initialize React 19 and Vite.
- [x] Define project coding standards in `project-rules.md`.
- [ ] Define the drum pad data structure.
- [ ] Define keyboard-to-pad mappings.
- [ ] Identify and verify available audio assets.

### Phase 2 — Audio Engine

- [ ] Create an isolated audio module.
- [ ] Implement audio initialization.
- [ ] Implement individual drum sound playback.
- [ ] Handle audio playback errors and browser restrictions.
- [ ] Verify audio resource management.

### Phase 3 — Drum Pad Components

- [ ] Create a reusable DrumPad component.
- [ ] Render seven pads from a data structure.
- [ ] Implement mouse interaction.
- [ ] Implement visual pressed and released states.
- [ ] Add accessible button labels and `aria-pressed`.

### Phase 4 — Keyboard Interaction

- [ ] Implement keyboard `keydown` handling.
- [ ] Implement keyboard `keyup` handling.
- [ ] Use `KeyboardEvent.code`.
- [ ] Prevent repeated triggers with `event.repeat`.
- [ ] Ignore keyboard events from form controls.
- [ ] Register and clean up event listeners correctly.

### Phase 5 — Visual Feedback

- [ ] Implement the hit log.
- [ ] Use `<output aria-live="polite">`.
- [ ] Display the most recent drum-pad interactions.
- [ ] Implement the visual decibel meter.
- [ ] Connect audio-level information to the meter.

### Phase 6 — Responsive UI and Accessibility

- [ ] Build the complete drum machine interface.
- [ ] Apply consistent visual styling.
- [ ] Implement responsive layouts.
- [ ] Verify the layout at 375px viewport width.
- [ ] Check keyboard navigation and visible focus.
- [ ] Verify semantic HTML and accessible labels.

### Phase 7 — Testing and Quality Assurance

- [ ] Test all seven drum pads using mouse interaction.
- [ ] Test all seven keyboard mappings.
- [ ] Verify `keydown` and `keyup` behavior.
- [ ] Verify repeated events do not trigger duplicate playback.
- [ ] Verify form controls do not activate drum pads.
- [ ] Verify hit log and decibel meter.
- [ ] Run `npm run build`.
- [ ] Run Lighthouse accessibility and performance checks.
- [ ] Fix identified issues.
- [ ] Create `AI_FAILURE_AUDIT.md` documenting at least three verified AI-generated bugs and their fixes.

## 4. Git Commit Plan

The following is a proposed sequence of meaningful development milestones. A commit should only be created after its corresponding implementation has been completed and verified.

| No. | Commit message                                                 | Scope                     |
| --: | -------------------------------------------------------------- | ------------------------- |
|   1 | `docs(hw1): define project rules and coding standards`         | Project rules             |
|   2 | `docs(hw1): define task decomposition and implementation plan` | Task breakdown            |
|   3 | `feat(hw1): define drum pad data mapping`                      | Pad configuration         |
|   4 | `feat(hw1): implement isolated drum audio engine`              | Audio engine              |
|   5 | `feat(hw1): add reusable drum pad component`                   | DrumPad component         |
|   6 | `feat(hw1): implement studio drum machine layout`              | Main UI                   |
|   7 | `feat(hw1): implement physical keyboard mapping`               | Keyboard mapping          |
|   8 | `feat(hw1): add keyboard event lifecycle and cleanup`          | Keyboard lifecycle        |
|   9 | `feat(hw1): implement accessible hit log`                      | Hit log                   |
|  10 | `feat(hw1): implement visual decibel meter`                    | Decibel meter             |
|  11 | `style(hw1): optimize responsive studio layout`                | Responsive design         |
|  12 | `test(hw1): verify drum kit functionality and accessibility`   | QA and final verification |

Note: The initial React/Vite setup commit is excluded from the HW1 commit count. The plan targets at least 10 meaningful HW1 commits; milestones may be adjusted to match the actual implementation without creating artificial commits.

## 5. Definition of Done

HW1 is considered complete when:

- All seven drum pads work correctly.
- Mouse and physical keyboard interactions work.
- Keyboard event handling follows the specified requirements.
- Audio playback works without unnecessary resource leaks.
- The hit log and decibel meter display correctly.
- Accessibility requirements are implemented.
- The application works at a 375px viewport width without horizontal overflow.
- Production build completes successfully.
- Lighthouse results have been checked.
- `AI_FAILURE_AUDIT.md` contains at least three verified bugs and their fixes.
- Git history contains at least 10 meaningful HW1 commits.
