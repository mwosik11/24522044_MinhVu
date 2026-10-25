# HW1_W2 - Project Rules

## 1. Project Objective

Build a production-oriented, accessible Data Grid
that satisfies the Homework 1 requirements in Lab 2.

Required functionality:

- Sorting
- Filtering
- Pagination
- Keyboard navigation
- Row selection and interactive controls
- Accessibility compliance

## 2. Technology Constraints

- Use Vite and Vanilla TypeScript.
- Do not use React or another UI framework.
- Do not use a third-party UI component library.
- Avoid adding dependencies unless they are justified.
- Use TypeScript interfaces and types to define component contracts.
- Keep application logic, data, styles, and entry-point code
  separated into appropriate modules.

## 3. Data Grid Contract

Implement the contract specified in Lab 2:

ColumnDef<T>:

- header: string
- accessorKey: keyof T
- sortable?: boolean

DataGridProps<T>:

- data: T[]
- columns: ColumnDef<T>[]
- onRowSelect?: (item: T) => void
- ariaLabel: string

Preserve type safety when accessing row data and column values.

## 4. HTML and Accessibility

- Use native table elements:
  table, thead, tbody, tr, th, and td.
- Use th scope="col" for column headers.
- Follow the Lab 2 requirement for ARIA grid semantics.
- Validate the actual accessibility tree in the browser.
- Support ArrowUp, ArrowDown, ArrowLeft, and ArrowRight
  for grid navigation.
- Enter selects the current row or cell as specified.
- Space toggles the applicable selection state.
- Provide visible keyboard focus.
- Maintain at least 4.5:1 contrast for normal text.
- Ensure keyboard interaction does not depend on a mouse.
- Verify the layout at a 375px viewport.

## 5. JavaScript and Security

- Use const by default and let only when reassignment is needed.
- Never use var.
- Never insert untrusted data using innerHTML.
- Use textContent and DOM APIs for dynamic text rendering.
- Do not use inline event handlers such as onclick attributes.
- Register and clean up event listeners when appropriate.
- Validate user input and handle empty or invalid data safely.

## 6. Architecture

- Separate data-grid contracts from implementation.
- Keep sorting, filtering, and pagination logic testable.
- Define predictable state transitions for interactive behavior.
- Avoid duplicating business logic across UI event handlers.
- Do not introduce premature performance optimizations.
- Avoid unnecessary abstractions and dead code.

## 7. Verification

- Verify every acceptance criterion before marking a task complete.
- Test sorting, filtering, and pagination independently.
- Test keyboard navigation and selection behavior.
- Test empty data and boundary cases.
- Inspect browser console errors.
- Run accessibility and Lighthouse audits.
- Do not claim a score or test result without actual evidence.

## 8. Git Workflow

- Use Conventional Commits.
- Commit each logical milestone separately.
- Inspect git diff before committing.
- Do not combine unrelated implementation tasks into one commit.
- Keep generated dependencies and build output out of Git.
- Never commit secrets or local environment credentials.

## 9. AI-Assisted Development

- Read these rules before proposing code changes.
- Follow TASK_DECOMPOSITION.md.
- Implement one atomic subtask at a time.
- Verify generated code before integrating it.
- Document actual defects and evidence in AI_FAILURE_AUDIT.md.
- Never fabricate test results or audit findings.
