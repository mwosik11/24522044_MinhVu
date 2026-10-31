# PROJECT RULES – EXERCISE 2

## Interactive Scientist & Pioneer Directory

### 1. Technology Stack

- React 19 with functional components and Hooks.
- Vite as the development and build tool.
- JavaScript (ES6+).
- CSS for styling.
- npm for dependency management.

### 2. React Rules

- Use functional components.
- Use `useState` for reactive state.
- Use `useId` to generate stable accessibility IDs for form controls.
- Do not use `useEffect` to calculate or synchronize filtered and sorted data.
- Calculate derived data directly during rendering.
- Use immutable state updates.
- Use `.toSorted()` instead of `.sort()` when sorting arrays.

### 3. Data Rules

- Store the original dataset in a separate data module.
- Every scientist must have a unique, stable ID.
- Use a consistent data schema for all scientist records.
- Do not mutate the original dataset during filtering, sorting, deletion, or reset.

### 4. Search, Filter, and Sorting

- Name search must be case-insensitive.
- Search should ignore leading and trailing whitespace.
- Minimum IQ must be handled as a numeric value using `valueAsNumber`.
- Support sorting by IQ and Age.
- Keep search, filtering, and sorting results derived from the current state.

### 5. Accessibility Rules

- Every form input must have an associated `<label>` using `htmlFor`.
- Generate input IDs with `useId()`.
- Display the result count using `<output role="status" aria-live="polite">`.
- Preserve keyboard accessibility and focus behavior when deleting records.

### 6. Component and Code Quality

- Keep components focused on a single responsibility.
- Separate data definitions from UI components.
- Use meaningful variable and function names.
- Use stable record IDs as React list keys.
- Avoid unnecessary state and unnecessary rendering logic.

### 7. Git Rules

- Work directly on the `main` branch.
- Do not create additional branches for this exercise.
- Preserve the three mandatory commit messages exactly as specified in the lab.
- Commit each required milestone separately.

### 8. Verification

- Test search, IQ filtering, sorting, deletion, and reset.
- Verify accessibility requirements.
- Use React DevTools Profiler to inspect rendering behavior.
- Capture screenshots as evidence for the report.
