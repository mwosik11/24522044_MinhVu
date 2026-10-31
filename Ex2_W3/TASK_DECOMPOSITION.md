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

- [ ] Implement controlled name search.
- [ ] Implement minimum IQ numeric filter using valueAsNumber.
- [ ] Implement IQ and Age sorting using toSorted().
- [ ] Calculate visible records directly during rendering.
- [ ] Avoid useEffect for derived state.
- [ ] Associate input labels using useId().
- [ ] Verify search and filtering behavior.

**Required commit:**
`feat(ex2): add search, IQ filter & toSorted`

### M4 – Delete, Reset, and Live Status

- [ ] Implement immutable delete functionality.
- [ ] Implement Reset functionality.
- [ ] Preserve stable keys using record IDs.
- [ ] Add result count using output, role="status", and aria-live="polite".
- [ ] Verify deletion and reset behavior.
- [ ] Verify keyboard focus behavior.

**Required commit:**
`feat(ex2): add delete/reset & live status`

### M5 – Testing and Verification

- [ ] Test case-insensitive name search.
- [ ] Test minimum IQ filtering.
- [ ] Test IQ and Age sorting.
- [ ] Test deleting Johann Goethe.
- [ ] Test Reset functionality.
- [ ] Verify accessibility requirements.
- [ ] Use React DevTools Profiler to verify one render pass per search keystroke.
- [ ] Capture screenshots for the report.
