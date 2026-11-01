# Project Rules — HW1: Production Studio Drum Kit

## 1. Project Environment

- Framework: React 19.
- Build tool: Vite.
- Language: JavaScript (ES6+), JSX.
- Package manager: npm.
- Architecture: Functional Components and React Hooks.

## 2. React Development Standards

- Use functional components only.
- Use React Hooks for state and lifecycle management.
- Keep components focused on a single responsibility.
- Use immutable state updates.
- Avoid unnecessary component re-renders.
- Use stable keys when rendering lists.
- Clean up event listeners, timers, and audio resources when components unmount.
- Do not use deprecated React APIs.

## 3. Keyboard Interaction

- Map the seven drum pads to W, A, S, D, J, K, and L.
- Use `KeyboardEvent.code` instead of deprecated `keyCode`.
- Handle both `keydown` and `keyup`.
- Ignore repeated keyboard events using `event.repeat`.
- Ignore keyboard shortcuts when the user is typing in INPUT, TEXTAREA, or SELECT elements.
- Register and remove keyboard event listeners correctly.

## 4. Audio Requirements

- Implement audio playback through an isolated audio module or engine.
- Keep audio logic separate from UI components.
- Ensure each drum pad triggers its corresponding sound.
- Release audio resources appropriately.
- Do not assume audio asset filenames or paths; verify available assets before referencing them.

## 5. Accessibility

- Use semantic HTML elements.
- Implement drum pads as accessible buttons.
- Use `aria-pressed` to expose pad activation state.
- Use an `<output>` element with `aria-live="polite"` for the hit log.
- Provide meaningful accessible labels for interactive controls.
- Maintain visible keyboard focus indicators.
- Ensure sufficient text and control contrast.

## 6. Visual and Responsive Design

- Build a responsive drum machine interface.
- Support mobile layouts at a viewport width of 375px.
- Prevent horizontal overflow.
- Use consistent spacing, typography, and component styling.
- Keep the interface usable with both mouse and keyboard.

## 7. Code Quality and Security

- Avoid `alert()` for application interactions.
- Do not use unsafe HTML injection such as `dangerouslySetInnerHTML`.
- Avoid unnecessary dependencies.
- Use descriptive variable and function names.
- Keep components and modules maintainable.
- Remove unused code and imports.

## 8. Git Workflow

- Use Conventional Commits.
- Make atomic commits at meaningful development milestones.
- Verify the implementation before committing.
- Do not combine unrelated changes in one commit.
- HW1 must have at least 10 meaningful commits, excluding the initial project setup commit.
- Do not create artificial commits solely to increase the commit count.

## 9. Verification

Before considering HW1 complete:

- Verify all seven drum pads.
- Verify physical keyboard interaction.
- Verify keydown and keyup behavior.
- Verify repeated key events do not trigger duplicate playback.
- Verify keyboard shortcuts are ignored while typing in form controls.
- Verify the hit log and visual decibel meter.
- Verify responsive behavior at 375px.
- Run the production build.
- Inspect accessibility using Lighthouse.
- Document at least three verified AI-generated bugs and their fixes in `AI_FAILURE_AUDIT.md`.
