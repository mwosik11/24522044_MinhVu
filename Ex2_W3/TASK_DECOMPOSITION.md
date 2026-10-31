# TASK DECOMPOSITION – EXERCISE 2

## Interactive Scientist & Pioneer Directory

### M0 – Project Initialization

- [x] Create a separate Ex2_W3 project folder.
- [x] Initialize React with Vite.
- [x] Install project dependencies.
- [x] Verify React 19 and React DOM versions.
- [x] Verify Vite development server.

### M1 – Project Documentation

- [x] Create project-rules.md.
- [x] Create TASK_DECOMPOSITION.md.
- [x] Review project structure and requirements.

### M2 – Data Schema and Stable IDs

- [x] Define the SMART_PEOPLE dataset.
- [x] Normalize the scientist data schema.
- [x] Assign stable, unique IDs to all records.
- [x] Verify data consistency.

**Required commit:**
`feat(ex2): normalize smartPeople schema with stable IDs`

### M3 – Search, IQ Filter, and Sorting

- [x] Implement controlled name search.
- [x] Implement minimum IQ numeric filter using valueAsNumber.
- [x] Implement IQ and Age sorting using toSorted().
- [x] Calculate visible records directly during rendering.
- [x] Avoid useEffect for derived state.
- [x] Associate input labels using useId().
- [x] Verify search and filtering behavior.

**Required commit:**
`feat(ex2): add search, IQ filter & toSorted`

### M4 – Delete, Reset, and Live Status

- [x] Implement immutable delete functionality.
- [x] Implement Reset functionality.
- [x] Preserve stable keys using record IDs.
- [x] Add result count using output, role="status", and aria-live="polite".
- [x] Verify deletion and reset behavior.
- [x] Verify keyboard focus behavior.

**Required commit:**
`feat(ex2): add delete/reset & live status`

### M5 – Testing and Verification

- [x] Test case-insensitive name search.
- [x] Test minimum IQ filtering.
- [x] Test IQ and Age sorting.
- [x] Test deleting Johann Goethe.
- [x] Test Reset functionality.
- [x] Verify accessibility requirements.
- [x] Use React DevTools Profiler to verify one render pass per search keystroke.
- [x] Capture screenshots for the report.
