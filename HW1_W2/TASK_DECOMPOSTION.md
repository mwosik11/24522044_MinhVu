# HW1_W2 - Task Decomposition

## Objective

Implement an accessible Data Grid with sorting, filtering,
pagination, keyboard navigation, and row selection.

## Milestone 0: Project Specification

- [x] Define project rules.
- [x] Define the implementation work breakdown.
- [ ] Initialize Git and commit the project specification.

## Milestone 1: Project Setup

- [ ] Initialize Vite with Vanilla TypeScript.
- [ ] Configure TypeScript and development scripts.
- [ ] Create the initial application entry point.
- [ ] Verify the development server starts successfully.

## Milestone 2: Type Contracts and Data Model

- [ ] Define ColumnDef<T>.
- [ ] Define DataGridProps<T>.
- [ ] Prepare representative sample data.
- [ ] Verify TypeScript type safety.

## Milestone 3: Semantic Data Grid

- [ ] Implement the table structure.
- [ ] Render column headers and data rows.
- [ ] Add accessible names and header associations.
- [ ] Verify the rendered DOM structure.

## Milestone 4: Sorting

- [ ] Implement ascending sorting.
- [ ] Implement descending sorting.
- [ ] Support columns that are not sortable.
- [ ] Test sorting and data preservation.

## Milestone 5: Filtering

- [ ] Define the filtering interface.
- [ ] Implement filtering against the appropriate data fields.
- [ ] Handle empty queries and zero matching results.
- [ ] Test filtering independently.

## Milestone 6: Pagination

- [ ] Define page size and current page state.
- [ ] Implement page navigation.
- [ ] Handle first-page and last-page boundaries.
- [ ] Reset or clamp the current page when filtered data changes.
- [ ] Test pagination independently.

## Milestone 7: Keyboard Navigation and Selection

- [ ] Define the active cell or row model.
- [ ] Implement ArrowUp and ArrowDown.
- [ ] Implement ArrowLeft and ArrowRight.
- [ ] Implement Enter selection.
- [ ] Implement Space toggling.
- [ ] Prevent inappropriate default browser behavior.
- [ ] Test navigation boundaries and selection state.

## Milestone 8: Accessibility and Responsive UI

- [ ] Apply the required semantic HTML and ARIA contract.
- [ ] Verify accessible names and keyboard focus.
- [ ] Verify normal-text contrast of at least 4.5:1.
- [ ] Verify keyboard-only operation.
- [ ] Verify the layout at 375px.
- [ ] Run Lighthouse Accessibility and Best Practices audits.
- [ ] Investigate and fix any failed checks.

## Milestone 9: Testing and Quality Assurance

- [ ] Test sorting, filtering, and pagination.
- [ ] Test keyboard navigation and row selection.
- [ ] Test empty data and boundary cases.
- [ ] Verify no browser console errors.
- [ ] Run the available automated tests.
- [ ] Record actual verification results.

## Milestone 10: AI Failure Mode Audit

- [ ] Review generated code for security vulnerabilities.
- [ ] Review event handling and resource management.
- [ ] Review accessibility and state-management defects.
- [ ] Document at least three actual defects or AI failure modes.
- [ ] Include diagnostic evidence and corrected solutions.

## Milestone 11: Finalization

- [ ] Write README.md with setup and execution instructions.
- [ ] Capture screenshots of the application and verification.
- [ ] Review the complete Git history.
- [ ] Verify all acceptance criteria.
- [ ] Prepare for the live code defense.

## Workflow Rules

1. Complete one atomic subtask at a time.
2. Verify each subtask before integration.
3. Commit each logical implementation milestone.
4. Do not mark a task complete without verification.
5. Do not fabricate audit results or Lighthouse scores.
