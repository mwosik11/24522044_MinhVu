# Homework 3 — Task Decomposition

## Project: Resilient Landing Page

### Objective
Build a resilient landing page using semantic HTML5, modern CSS, and Vanilla JavaScript ES6+.

### Architectural Constraints
- Use Vanilla HTML5, CSS, and JavaScript only.
- Do not use jQuery, Bootstrap, Tailwind, or external script CDNs.
- Use semantic HTML elements and accessible form labels.
- Use `const` by default and `let` only when reassignment is necessary.
- Do not insert untrusted user input using `innerHTML`.
- Support a mobile viewport of 375px without horizontal scrolling.
- Separate functionality into independently testable tasks.

### T-01: Countdown Engine
- Use a valid UTC ISO 8601 target timestamp.
- Calculate remaining time from the target timestamp and current time.
- Avoid cumulative timer drift by recalculating from timestamps.
- Handle expired or invalid target timestamps.
- Define and verify the HTML-to-JavaScript contract.

### T-02: Form State Machine
- Define the states: Idle, Submitting, Success, and Error.
- Specify valid state transitions.
- Display accessible feedback for submission results.
- Keep form state transitions separate from presentation logic.

### T-03: Double-submit Prevention and Input Safety
- Prevent duplicate submissions while a submission is in progress.
- Validate input before processing.
- Render user-provided text safely.
- Avoid unsafe `innerHTML` usage.
- Verify keyboard accessibility and error feedback.

### T-04: Integration and Quality Assurance
- Verify the three slices independently before integration.
- Test countdown behavior and invalid timestamps.
- Test form state transitions and duplicate submissions.
- Test input safety and keyboard navigation.
- Verify responsive layout at 375px.
- Inspect browser console and Git diffs.

### T-05: AI Failure Audit
- Record three AI-induced defects actually identified during code review.
- Describe each defect and its impact.
- Document the diagnostic method used.
- Record the refactored solution and verification evidence.

### Git Workflow
- Make small, task-specific commits.
- Do not combine unrelated features into a monolithic commit.
- Inspect changes before committing.
- Maintain at least five atomic commits corresponding to the implementation slices and supporting work.
### Countdown Engine — HTML/JavaScript Contract

#### HTML Interface
- The countdown root element must expose a `data-countdown-target` attribute.
- The target value must be a valid UTC ISO 8601 timestamp.
- The output elements must use `data-unit` values: `days`, `hours`, `minutes`, and `seconds`.
- The countdown status element must be available for expiration and invalid-timestamp messages.

#### JavaScript Responsibilities
- Read the target timestamp from the HTML contract.
- Calculate remaining time using the target timestamp and the current time.
- Recalculate from timestamps on every update; do not decrement a stored counter.
- Update only the countdown output elements and status element.
- Handle invalid timestamps and expired targets safely.

#### Verification Criteria
- Correctly calculate the remaining days, hours, minutes, and seconds.
- Do not accumulate timer drift through repeated decrement operations.
- Handle expired and invalid timestamps.
- Avoid console errors.
- Preserve accessibility and responsive layout.
