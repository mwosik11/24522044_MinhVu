# HW3 – PUBG Vietnam Arena

## Work Breakdown Structure (WBS)

### 1. Project Objective

Build a React 19 web application simulating the PUBG Vietnam Series (PVS) Championship and Airdrop Arena.

The application covers three main engineering areas:

1. Zero-drift airdrop and ticket countdown.
2. Optimistic crate/ticket claiming with HTTP 409 rollback.
3. PUBG Vietnam squad leaderboard and kill-feed filtering.

### 2. Technology Stack

- React 19
- Vite
- JavaScript ES2024
- React Hooks
- Vitest
- React Testing Library

### 3. Work Breakdown Structure

#### Phase 1 – Domain Modeling and Data Layer

**WBS 1.1 – Define PUBG Domain Contracts**

- Define the `PubgCrateDrop` data structure.
- Define the `PubgVnSquadStanding` data structure.
- Define the drop lifecycle phases:
  - `WARMUP`
  - `AIRDROP_LIVE`
  - `LOOTED_OUT`
  - `EXPIRED`
- Define the claim lifecycle states.

**WBS 1.2 – Create Mock Data**

- Create PUBG crate and ticket drop data.
- Create Vietnamese squad standings.
- Create sample kill-feed events.
- Keep domain data separate from UI components.

#### Phase 2 – Zero-Drift Countdown Engine

**WBS 2.1 – Implement Countdown Utility**

- Calculate remaining time using an absolute target timestamp.
- Support server time offset.
- Prevent negative remaining time.
- Avoid decrement-based countdown logic.

**WBS 2.2 – Implement `usePubgAirdropTimer`**

- Integrate countdown calculations with React state.
- Synchronize time when the component mounts.
- Update countdown values periodically.
- Handle `visibilitychange` when the browser tab becomes visible.
- Clean up intervals and event listeners.

**WBS 2.3 – Implement Countdown UI**

- Display remaining time.
- Display current airdrop phase.
- Reflect transitions between lifecycle states.

#### Phase 3 – Optimistic Claim and Inventory State Machine

**WBS 3.1 – Define Claim State Machine**

- Define explicit claim states.
- Handle valid state transitions.
- Prevent contradictory UI states.

**WBS 3.2 – Implement Optimistic Inventory Updates**

- Decrease available stock immediately after a claim begins.
- Prevent duplicate submissions.
- Prevent inventory from becoming negative.
- Preserve the previous stock value for rollback.

**WBS 3.3 – Implement HTTP 409 Rollback**

- Simulate or handle HTTP 409 Conflict.
- Restore the previous inventory after a conflict.
- Display a meaningful conflict message.
- Release the in-flight claim lock.

**WBS 3.4 – Implement Claim UI**

- Display ticket/crate information.
- Display price in Vietnamese đồng (VND).
- Display remaining inventory.
- Display claiming, success, and failure states.

#### Phase 4 – PUBG Vietnam Leaderboard and Kill-Feed

**WBS 4.1 – Implement Squad Leaderboard**

- Display Vietnamese squad standings.
- Include WWCD, Placement Points, and Kill Points.
- Use stable squad identifiers.

**WBS 4.2 – Implement Filtering and Sorting**

- Filter squad standings.
- Sort by WWCD.
- Sort by Placement Points.
- Sort by Kill Points.
- Derive filtered and sorted data without redundant state synchronization.

**WBS 4.3 – Implement Kill-Feed**

- Display sample match events.
- Display event information clearly.
- Implement event filtering where applicable.

#### Phase 5 – Quality, Testing, and Verification

**WBS 5.1 – Responsive UI and Accessibility**

- Verify the 375px mobile viewport.
- Use semantic HTML.
- Provide accessible labels for form controls.
- Provide keyboard-accessible interactions.
- Verify visible focus states.

**WBS 5.2 – Automated Testing**

- Test countdown calculations.
- Test timer lifecycle and cleanup.
- Test claim state transitions.
- Test optimistic inventory updates.
- Test HTTP 409 rollback.
- Test duplicate claim prevention.
- Test leaderboard filtering and sorting.
- Test kill-feed behavior.

**WBS 5.3 – Production Verification**

- Run the complete automated test suite.
- Run the production build.
- Inspect browser Console.
- Verify responsive behavior.
- Capture screenshots for the final report.

**WBS 5.4 – AI Failure Audit**

- Document at least three verified AI-generated defects.
- Record the original defect and its root cause.
- Include diagnostic evidence.
- Document the engineering fix.
- Verify that the corrected implementation works.

### 4. Atomic Git Commit Mapping

The following commits represent the planned implementation sequence. Every implementation milestone must be completed and verified before committing.

| Commit | WBS | Planned Commit Message                                        |
| ------ | --- | ------------------------------------------------------------- |
| 1      | 1.1 | `feat(hw3): define PUBG Vietnam domain contracts`             |
| 2      | 1.2 | `feat(hw3): add PUBG Vietnam mock data`                       |
| 3      | 2.1 | `feat(hw3): implement countdown calculation utility`          |
| 4      | 2.2 | `feat(hw3): implement anti-drift airdrop timer hook`          |
| 5      | 2.3 | `feat(hw3): build airdrop countdown interface`                |
| 6      | 3.1 | `feat(hw3): define crate claim state machine`                 |
| 7      | 3.2 | `feat(hw3): implement optimistic inventory updates`           |
| 8      | 3.3 | `feat(hw3): implement HTTP 409 inventory rollback`            |
| 9      | 3.4 | `feat(hw3): build ticket and crate claim interface`           |
| 10     | 4.1 | `feat(hw3): implement PUBG Vietnam squad leaderboard`         |
| 11     | 4.2 | `feat(hw3): add leaderboard filtering and sorting`            |
| 12     | 4.3 | `feat(hw3): implement PUBG match kill-feed`                   |
| 13     | 5.1 | `feat(hw3): improve responsive layout and accessibility`      |
| 14     | 5.2 | `test(hw3): add automated feature and edge case tests`        |
| 15     | 5.3 | `test(hw3): verify production build and application behavior` |
| 16     | 5.4 | `docs(hw3): document verified AI implementation failures`     |

### 5. Definition of Done

A WBS task is considered complete only when:

- Its implementation is present in the project.
- Its relevant behavior has been tested.
- No known regression has been introduced.
- The corresponding Git commit has been created.
- The implementation is consistent with `project-rules.md`.

### 6. Project Constraints

- Minimum 10 meaningful implementation commits, excluding global setup commits.
- No monolithic implementation of all features in one step.
- No unverified AI-generated code.
- No fabricated test results or AI failure incidents.
- Maintain a traceable relationship between WBS tasks and Git history.
