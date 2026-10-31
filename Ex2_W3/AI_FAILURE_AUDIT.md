# AI_FAILURE_AUDIT — Exercise 2

## 1. Project Context

**Exercise:** Interactive Scientist & Pioneer Directory  
**Project:** React 19 + Vite  
**Audit Purpose:** Document the implementation errors, validation issues, and corrections encountered during the development of Exercise 2.

This audit records the actual issues identified during implementation and testing, together with their causes, impacts, and corrective actions.

## 2. Identified AI and Implementation Failures

### 2.1. Incorrect Initial SMART_PEOPLE Dataset

**Issue:**

The initial implementation contained only five records, whereas the Lab 03 reference specified six scientists.

**Impact:**

The application did not initially match the required reference dataset.

**Root Cause:**

The initial dataset was created based on an incomplete interpretation of the assignment requirements rather than verifying every record against the original lab reference.

**Correction:**

The dataset was updated to match the exact six records specified in Lab 03:

- `sp-1` — Johann Goethe
- `sp-2` — Albert Einstein
- `sp-3` — Leonardo da Vinci
- `sp-4` — Isaac Newton
- `sp-5` — James Maxwell
- `sp-6` — William Sidis

**Lesson Learned:**

Always verify the complete dataset, including record count, field names, values, and stable IDs, against the original assignment before implementing application logic.

### 2.2. Accessibility Failure — Insufficient Color Contrast

**Issue:**

The initial Lighthouse Accessibility audit detected insufficient contrast between foreground and background colors.

Affected elements included:

- Atlas wordmark.
- Statistic labels and descriptions.
- Section introductory text.
- Form labels.
- Profile numbers.
- Scientist role labels.
- Intelligence quotient labels.
- Other secondary text elements.

**Impact:**

Although the interface looked visually consistent, several text elements did not satisfy the required color contrast ratio.

**Root Cause:**

The initial design used muted green and gray colors that were too light against ivory and white backgrounds.

**Correction:**

The text color palette was adjusted in `src/index.css` and `src/App.css`.

The updated colors improved text readability while preserving the original layout, typography, and overall visual design.

**Verification:**

After the corrections, Lighthouse Accessibility achieved a score of **100/100**.

**Lesson Learned:**

Visual appearance alone does not guarantee accessibility compliance. Color contrast must be evaluated using WCAG criteria and verified through accessibility testing tools.

### 2.3. Git Whitespace Validation Failure

**Issue:**

During the final validation process, the command `git diff --check` reported:

`src/App.css:1160: new blank line at EOF.`

**Impact:**

The Git whitespace validation check did not pass.

**Root Cause:**

An unnecessary blank line remained at the end of `src/App.css`.

**Correction:**

The extra blank line was removed, and `git diff --check` was executed again.

**Lesson Learned:**

Always perform Git whitespace validation before committing changes to maintain clean and consistent source files.

## 3. Testing and Verification Results

The following checks were performed during Exercise 2:

| Testing Category                | Result                                            |
| ------------------------------- | ------------------------------------------------- |
| SMART_PEOPLE dataset validation | Passed after correction                           |
| Name search                     | Tested                                            |
| Minimum IQ filtering            | Tested                                            |
| Sorting by IQ and Age           | Tested                                            |
| Delete functionality            | Tested                                            |
| Reset functionality             | Tested                                            |
| Label and input accessibility   | Inspected using Chrome DevTools                   |
| Live status accessibility       | Verified `role="status"` and `aria-live="polite"` |
| Delete button accessible name   | Verified in Accessibility Tree                    |
| Lighthouse Accessibility        | 100/100                                           |
| Production build                | Successful                                        |
| Git whitespace validation       | Passed after correction                           |

**React DevTools Profiler:**

The assignment required verifying that typing one character into the search field triggered exactly one render pass. The result should be documented based on the actual Profiler evidence rather than inferred from other successful tests.

## 4. Lessons Learned

1. **Requirement Verification:** Always use the original assignment reference as the source of truth before implementing features or datasets.

2. **Data Accuracy:** Validate the number of records, stable IDs, field names, and values before connecting data to the user interface.

3. **Accessibility Awareness:** Correct HTML semantics and ARIA attributes are important, but they do not automatically guarantee sufficient color contrast.

4. **Evidence-Based Testing:** Use browser developer tools, Lighthouse, and React DevTools to verify application behavior instead of relying solely on visual inspection.

5. **Code Quality:** Run production builds and Git validation commands before committing changes.

6. **Focused Git Commits:** Keep implementation milestones, bug fixes, accessibility improvements, and documentation changes in separate commits to maintain a clear project history.

## 5. Final Assessment

During Exercise 2, three confirmed issues were identified and corrected:

- Initial dataset did not match the six-record lab reference.
- Insufficient text contrast was detected by Lighthouse.
- An unnecessary trailing blank line was detected by Git whitespace validation.

After applying the corrections, the production build completed successfully, and the Lighthouse Accessibility score reached **100/100**.

This audit documents the observed implementation failures, their root causes, corrective actions, and lessons learned throughout Exercise 2.
