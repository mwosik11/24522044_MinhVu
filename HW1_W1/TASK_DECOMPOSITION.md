# TASK DECOMPOSITION — HOMEWORK 1
## Production Portfolio

### 1. Project Objective

Build a production-quality Developer Portfolio using semantic HTML5, modern CSS, and Vanilla JavaScript.

The portfolio must demonstrate responsive design, accessibility, secure coding practices, maintainable architecture, and performance optimization.

### 2. Technical Constraints

- Use semantic HTML5, modern CSS, and Vanilla JavaScript ES6+.
- Do not use jQuery, Bootstrap, Tailwind CSS, or external script CDNs.
- Do not use inline event handlers such as `onclick`.
- Use CSS custom properties for design tokens and theme colors.
- Use `const` by default and `let` only when reassignment is required.
- Support keyboard navigation without requiring a mouse.
- Verify the layout at a minimum viewport width of 375px.
- Do not insert untrusted user input using `innerHTML`.
- Persist the selected theme using `localStorage` with the key `theme`.
- Inspect Git diffs and verify AI-generated code before committing.

### 3. Functional Scope

The portfolio will contain:

1. **Hero Section:** Introduction, professional headline, and project navigation link.
2. **About Section:** Personal introduction and development goals.
3. **Skills Section:** Technical skills presented using accessible elements.
4. **Projects Section:** Project cards containing titles, descriptions, and source links.
5. **Contact Section:** Contact information and an email link.
6. **Theme Switcher:** Accessible light/dark theme toggle with persistent preference.
7. **Responsive Navigation:** Navigation links usable on mobile and desktop.

### 4. Work Breakdown Structure

#### T-01: Project Specification and Architecture

Tasks:
- Define the functional requirements and acceptance criteria.
- Define the HTML structure and component contracts.
- Identify CSS design tokens and theme states.
- Define the JavaScript responsibilities and DOM interfaces.
- Establish the Git commit plan.

Deliverable:
- `TASK_DECOMPOSITION.md`

Acceptance criteria:
- Tasks are divided into independently verifiable units.
- HTML, CSS, and JavaScript responsibilities are clearly defined.

Git commit:
`docs(spec): define portfolio contracts and WBS`

#### T-02: Semantic HTML Architecture

Tasks:
- Create the HTML5 boilerplate.
- Implement semantic landmarks: `header`, `nav`, `main`, `section`, `article`, and `footer`.
- Add an accessible skip link.
- Maintain one primary `h1` and a logical heading hierarchy.
- Implement the Hero, About, Skills, Projects, and Contact sections.
- Add accessible labels and names where required.
- Define the DOM contract for the theme switcher.

Deliverable:
- `index.html`

Acceptance criteria:
- Semantic landmarks are present and correctly structured.
- All navigation links point to valid page sections.
- The document has one primary `h1`.
- Keyboard users can access the main content through the skip link.
- No unnecessary `div` elements are used.

Git commit:
`feat(html): build semantic portfolio structure`

#### T-03: CSS Foundation and Responsive Layout

Tasks:
- Create a global CSS reset using `box-sizing: border-box`.
- Define design tokens in `:root`.
- Implement typography, spacing, colors, borders, and focus indicators.
- Use Flexbox for one-dimensional layouts.
- Use CSS Grid for project cards and other two-dimensional layouts.
- Implement mobile-first responsive styling.
- Ensure the layout works at 375px without horizontal scrolling.

Deliverable:
- `styles.css`

Acceptance criteria:
- The layout is usable at 375px and desktop widths.
- No unintended horizontal overflow occurs.
- Theme colors are managed through CSS variables.
- Keyboard focus indicators remain visible.
- Text and interface components meet applicable contrast requirements.

Git commit:
`feat(css): implement responsive portfolio design`

#### T-04: Theme Engine

Tasks:
- Implement the theme toggle using `querySelector` and event listeners.
- Use CSS classes or attributes to represent the active theme.
- Synchronize the button's `aria-pressed` attribute with the actual state.
- Update the accessible button name when appropriate.
- Save the selected theme using `localStorage` key `theme`.
- Restore the saved theme when the page loads.
- Verify behavior when no saved preference exists.

Deliverable:
- `script.js`

Acceptance criteria:
- The theme toggle works with mouse and keyboard.
- The button's accessible state reflects the active theme.
- Theme preference persists after page reload.
- Theme switching produces no JavaScript console errors.

Git commit:
`feat(js): implement accessible theme engine`

#### T-05: Accessibility and Keyboard Audit — M1 and M2

Tasks:
- Audit WCAG 2.2 AA requirements applicable to the portfolio.
- Verify semantic landmarks and heading hierarchy.
- Test text and interface contrast.
- Navigate the entire page using Tab and Shift+Tab.
- Verify visible focus indicators.
- Check that focus is not trapped unexpectedly.
- Verify that interactive elements have accessible names.
- Fix all identified accessibility defects.

Deliverable:
- A documented accessibility and keyboard audit.

Acceptance criteria:
- Applicable WCAG 2.2 AA criteria are tested.
- All interactive elements can be operated by keyboard.
- Focus order is logical and visible.
- No unintended keyboard traps remain.
- Audit findings and fixes are documented.

Git commits:
- `fix(a11y): contrast & landmarks`
- `fix(nav): keyboard trap prevention`

#### T-06: Content Security Policy and Secure Coding — M3

Tasks:
- Remove all inline event handlers.
- Configure a restrictive Content Security Policy compatible with the application.
- Keep JavaScript and CSS compatible with the selected CSP.
- Avoid unsafe DOM insertion of untrusted content.
- Verify that required resources load without unintended CSP violations.
- Inspect browser console security warnings.

Deliverable:
- A CSP configuration and security verification record.

Acceptance criteria:
- No inline event handlers remain.
- No unnecessary external script dependencies are introduced.
- Required application functionality works under the configured CSP.
- No known unsafe user-input insertion patterns remain.

Git commit:
`fix(security): enforce CSP and remove inline handlers`

#### T-07: Performance Optimization — M4

Tasks:
- Inspect the page using Chrome DevTools and Lighthouse.
- Optimize images and other assets where applicable.
- Provide image dimensions to reduce layout shifts.
- Review LCP, CLS, and other relevant performance findings.
- Correct identified bottlenecks.
- Repeat the Lighthouse audit after optimization.

Deliverable:
- An optimized portfolio and recorded Lighthouse results.

Acceptance criteria:
- The Lighthouse audit is completed and its results are recorded.
- The target Lighthouse score is 100, subject to actual test results.
- No avoidable layout shifts are identified.
- Performance changes do not break accessibility or functionality.

Git commit:
`perf: optimize assets`

#### T-08: Final Verification and Submission

Tasks:
- Test all portfolio sections and navigation links.
- Verify theme persistence and keyboard interaction.
- Repeat responsive, accessibility, security, and performance checks.
- Inspect the complete Git diff and commit history.
- Document known limitations and unresolved issues.

Deliverable:
- Final portfolio source code.
- Git commit history.
- Accessibility, security, and performance verification records.

Acceptance criteria:
- All defined functional requirements are tested.
- No known critical defects remain.
- Git history shows isolated, understandable changes.
- Test results are recorded without claiming unverified compliance.

### 5. Git Commit Policy

- Commit each independently verifiable milestone separately.
- Inspect `git diff` before each commit.
- Do not combine unrelated changes into a single commit.
- Do not commit broken or unverified functionality as a completed milestone.
- Push the completed work to the existing repository only after local verification.

### 6. Final Acceptance Criteria

The portfolio will be considered complete when:

- All defined portfolio sections are implemented.
- The page works at a 375px viewport and desktop widths.
- Keyboard navigation and theme switching work correctly.
- Applicable accessibility requirements have been audited.
- Content Security Policy and secure coding practices have been verified.
- Lighthouse results have been recorded.
- Required milestone commits exist in Git history.
- The final implementation can be explained during the instructor's live defense.
