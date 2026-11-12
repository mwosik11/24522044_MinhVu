# AI FAILURE AUDIT

## Bonus Exercise – Hẹn Hò Nhưng Không Yêu (Situationship Analyzer)

**Project:** Bonus Exercise – React 19  
**Technology:** React 19, Vite, JavaScript, Vitest, Node.js Test Runner  
**Purpose:** Document AI-generated implementation mistakes, testing issues, their impact, and corrective actions.

---

## 1. Overview

During the development of the Situationship Analyzer, AI-assisted implementation introduced several defects involving test framework configuration, accessibility testing, test execution scripts, and accessible naming.

These issues were identified through independent verification, terminal output, and automated tests.

This audit documents the actual issues encountered during development and the corrective actions taken.

## 2. Identified AI Failures

### Failure 01 – Incorrect Test Runner Configuration

**Category:** Testing Infrastructure / Configuration

**AI-generated mistake:**

The initial test configuration used Vitest to execute all files matching the `.test.js` pattern.

However, the existing domain test files used Node.js built-in testing modules:

- `node:test`
- `node:assert/strict`

Vitest discovered these files but could not recognize their tests as Vitest test suites.

**Observed error:**

```text
Error: No test suite found in file
```

**Impact:**

- Five domain test suites failed when executed through Vitest.
- Existing domain tests were incorrectly reported as failed suites.
- The overall `npm test` command could not complete successfully.

**Root cause:**

The AI did not properly account for the project's use of two different testing frameworks.

**Corrective action:**

The test execution scripts were separated:

```json
{
  "test:domain": "node --test src/domain/*.test.js",
  "test:hooks": "vitest run src/hooks/useGhostingTimer.test.jsx",
  "test:components": "vitest run src/components/SituationshipAnalyzer.test.jsx",
  "test:a11y": "vitest run src/components/SituationshipAnalyzer.accessibility.test.jsx"
}
```

The main test script was configured to execute the test groups sequentially.

**Prevention:**

Always identify the testing framework used by existing test files before generating or modifying project-level test scripts.

---

### Failure 02 – Unsupported Accessibility Matcher

**Category:** Accessibility Testing / Test Dependencies

**AI-generated mistake:**

The generated accessibility test used:

```javascript
expect(element).toHaveFocus();
```

However, the project had not configured the `jest-dom` matcher extensions required by this assertion.

**Observed error:**

```text
Error: Invalid Chai property: toHaveFocus
```

**Impact:**

- One accessibility test failed.
- The keyboard navigation test could not verify focus using the unsupported matcher.

**Root cause:**

The AI assumed that Jest DOM matchers were available in the Vitest environment without checking the actual testing configuration.

**Corrective action:**

The assertion was replaced with the native DOM API:

```javascript
expect(document.activeElement).toBe(returnButton);
```

This directly verifies which element currently owns keyboard focus.

**Prevention:**

Verify available assertion APIs and test dependencies before using framework-specific matchers.

---

### Failure 03 – Missing Accessibility Test Script

**Category:** Project Configuration / Test Automation

**AI-generated mistake:**

The main `npm test` script was updated to execute:

```text
npm run test:a11y
```

However, the corresponding `test:a11y` script had not yet been registered in `package.json`.

**Observed error:**

```text
npm error Missing script: "test:a11y"
```

**Impact:**

- The domain, hook, and component test groups executed successfully.
- The complete test pipeline stopped before executing accessibility tests.

**Root cause:**

The AI updated the main test pipeline without ensuring that every referenced script existed.

**Corrective action:**

The missing script was registered:

```bash
npm pkg set "scripts.test:a11y=vitest run src/components/SituationshipAnalyzer.accessibility.test.jsx"
```

The main test command was then configured to include all four test groups.

**Prevention:**

Whenever a package script references another script, verify that the referenced script exists before running the complete pipeline.

---

### Failure 04 – Incorrect Accessible Heading Name

**Category:** WCAG Accessibility / Semantic HTML

**AI-generated mistake:**

During the dashboard redesign, the original heading:

```jsx
<h1>Situationship Analyzer</h1>
```

was changed into:

```jsx
<h1 id="sa-page-title">
  Situationship
  <span> Analyzer.</span>
</h1>
```

The accessible name computed by the testing environment did not match the existing component test query.

**Observed error:**

```text
Unable to find an accessible element with the role "heading"
and name "Situationship Analyzer"
```

The testing output identified the heading as:

```text
SituationshipAnalyzer.
```

**Impact:**

- One of seven component tests failed.
- The heading could not be located using the expected accessible name.

**Root cause:**

The AI changed the semantic naming behavior while redesigning the visual heading and did not revalidate the existing accessibility test contract.

**Corrective action:**

An explicit accessible name was added:

```jsx
<h1 id="sa-page-title" aria-label="Situationship Analyzer">
  Situationship <span>Analyzer.</span>
</h1>
```

This preserves the visual presentation while providing a stable accessible name.

**Prevention:**

Re-run semantic and accessibility tests after changing heading structure, labels, live regions, or other accessible names.

---

## 3. Lessons Learned

The identified failures demonstrate several important principles for AI-assisted React development:

1. AI-generated code must be verified against the actual project dependencies and configuration.
2. Existing test infrastructure should be inspected before changing test commands.
3. Accessibility must be tested through semantic roles, accessible names, labels, and keyboard interactions.
4. A successful production build does not guarantee that automated tests or accessibility requirements are satisfied.
5. Every AI-generated implementation should be independently reviewed before being accepted.

## 4. Verification Checklist

- [x] Identified the incompatible test runner configuration.
- [x] Corrected unsupported accessibility matcher usage.
- [x] Registered the missing accessibility test script.
- [x] Corrected the accessible heading name.
- [ ] Run all 62 automated tests after the final UI redesign.
- [ ] Verify the final production build.
- [ ] Perform manual keyboard and screen-reader checks.
- [ ] Review the final accessibility results.

## 5. Conclusion

The AI-assisted development process accelerated implementation but also introduced configuration and accessibility defects.

These failures were detected through automated testing and independent verification rather than being accepted without review.

The corrective process improved the reliability of the testing pipeline and reinforced the importance of human oversight in AI-assisted software engineering.
