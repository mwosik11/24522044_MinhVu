# AI Failure Audit – HW3: KRAFTON PUBG Vietnam Arena

## 1. Overview

This document records three implementation defects identified during the AI-assisted development of the KRAFTON x PUBG Vietnam Championship & Airdrop Arena.

Each defect was investigated through Chrome DevTools, source-code inspection, manual browser testing, and automated testing.

The purpose of this audit is to demonstrate that AI-generated code was independently reviewed, debugged, corrected, and verified before final submission.

---

## 2. Failure #01 – Incorrect ES Module Import Causing a Blank Application

**Category:** React runtime / ES Module integration

**Affected file:** `src/hooks/useOptimisticInventory.js`

### Observed Behavior

After integrating the Crate Claim Interface, the application displayed a completely blank page.

Chrome DevTools Console reported:

```text
Uncaught SyntaxError:
The requested module '/src/domain/claimStateMachine.js'
does not provide an export named 'CLAIM_STATUS'
```

The error originated from:

```text
useOptimisticInventory.js:6
```

### Root Cause

The implementation attempted to import `CLAIM_STATUS` from `claimStateMachine.js`.

However, the constant was actually exported by `pubgContracts.js`.

This module export/import mismatch prevented the browser from successfully loading the dependent module, so React could not render the application.

### Engineering Fix

The imports were corrected:

```javascript
import { CLAIM_STATUS } from "../domain/pubgContracts.js";

import {
  CLAIM_ACTION,
  createInitialClaimState,
  claimReducer,
} from "../domain/claimStateMachine.js";
```

### Verification Evidence

- Chrome DevTools Console initially displayed the missing named export error.
- The import path was corrected.
- The application rendered successfully after the correction.
- Production build completed successfully.

**Final Status:** RESOLVED

---

## 3. Failure #02 – Incomplete Airdrop Expiration Lifecycle

**Category:** Domain modeling / State transition logic

**Affected files:**

- `src/data/pubgMockData.js`
- `src/domain/pubgContracts.js`
- `src/components/CrateClaimCard.jsx`

### Observed Behavior

The initial implementation supported:

- `WARMUP`
- `AIRDROP_LIVE`
- `LOOTED_OUT`

However, `EXPIRED` was declared in the domain contract without a corresponding expiration condition in the component.

Once an airdrop reached its start timestamp, it could remain in `AIRDROP_LIVE` indefinitely while inventory was still available.

### Root Cause

The original `PubgCrateDrop` model only included:

```javascript
dropEpochMs;
```

This represented the starting timestamp but did not define when the airdrop should end.

Consequently, the component had insufficient information to determine whether the event had expired.

### Engineering Fix

An additional timestamp was introduced:

```javascript
dropEndEpochMs;
```

The phase calculation was updated:

```javascript
let phase;

if (timeUntilStart > 0) {
  phase = DROP_PHASE.WARMUP;
} else if (timeUntilEnd === 0) {
  phase = DROP_PHASE.EXPIRED;
} else if (remainingStock === 0) {
  phase = DROP_PHASE.LOOTED_OUT;
} else {
  phase = DROP_PHASE.AIRDROP_LIVE;
}

const isLive = phase === DROP_PHASE.AIRDROP_LIVE;
```

The implementation now distinguishes the beginning and ending of each airdrop.

### Verification Evidence

The four lifecycle scenarios were manually tested using different timestamps:

| Test scenario                               | Expected phase |
| ------------------------------------------- | -------------- |
| Current time before start                   | WARMUP         |
| Between start and end                       | AIRDROP_LIVE   |
| Inventory reaches zero during active period | LOOTED_OUT     |
| Current time passes end timestamp           | EXPIRED        |

All four scenarios were confirmed through browser testing.

Automated lifecycle tests were also added in:

```text
src/components/CrateClaimCard.test.jsx
```

**Final Status:** RESOLVED

---

## 4. Failure #03 – Incorrect Claim Button Label After Airdrop Expiration

**Category:** UI state consistency / Conditional rendering

**Affected file:** `src/components/CrateClaimCard.jsx`

### Observed Behavior

After the expiration lifecycle was implemented, the Claim button was correctly disabled for an expired airdrop.

However, its displayed text could still be:

```text
COMING SOON
```

This was misleading because the airdrop had already expired rather than waiting to start.

### Root Cause

The initial button-label condition only distinguished between pending claims, sold-out inventory, and non-live airdrops.

It did not prioritize the explicit `EXPIRED` state.

As a result, an expired airdrop could fall through to the generic non-live condition.

### Engineering Fix

The button-label condition was updated to handle expiration explicitly:

```jsx
{
  isClaimPending
    ? "PROCESSING..."
    : phase === DROP_PHASE.EXPIRED
      ? "EXPIRED"
      : remainingStock <= 0
        ? "SOLD OUT"
        : !isLive
          ? "COMING SOON"
          : "CLAIM NOW";
}
```

The expiration condition is evaluated before the generic non-live condition.

### Verification Evidence

An automated test was added:

```text
src/components/CrateClaimCard.test.jsx
```

The test verifies that:

- The status displays `EXPIRED`.
- The Claim button displays `EXPIRED`.
- The Claim button is disabled after expiration.

The complete Crate Claim Lifecycle test group passed all four tests.

**Final Status:** RESOLVED

---

## 5. Final Verification Summary

### Automated Testing

The final test suite covers the following areas:

| Test Group            |      Passed |
| --------------------- | ----------: |
| Claim State Machine   |          11 |
| Countdown Utility     |           9 |
| Countdown Hook        |           8 |
| Optimistic Inventory  |          11 |
| Squad Leaderboard     |           8 |
| Kill-Feed             |           8 |
| Crate Claim Lifecycle |           4 |
| **Total**             | **59 / 59** |

### Manual Verification

The following behaviors were verified in the browser:

- Airdrop countdown synchronization.
- All four airdrop lifecycle phases.
- Optimistic inventory deduction.
- HTTP 409 inventory rollback.
- Duplicate claim prevention.
- PUBG Vietnam squad filtering and sorting.
- Kill-feed searching and weapon filtering.
- Responsive layout at 375px.
- Form control accessibility.
- Keyboard accessibility.

### Production Verification

- Production build completed successfully.
- Production preview was tested.
- No known JavaScript runtime errors remained during final verification.

---

## 6. Engineering Lessons

The development process highlighted three important engineering principles:

1. **Module integrity:** Named exports and imports must be checked carefully because incorrect module dependencies can prevent an entire React application from loading.

2. **Complete domain modeling:** Every declared domain state must have corresponding data and transition logic. Defining an enum alone does not implement a complete lifecycle.

3. **UI-state consistency:** Conditional rendering must explicitly account for every business state to prevent misleading user interfaces.

AI-generated code should never be considered correct solely because it compiles. It must be validated through browser inspection, automated tests, and production verification.

---

## 7. Conclusion

Three implementation defects were identified, investigated, and corrected during HW3 development.

The final implementation passed the recorded automated test suite with 59 tests and underwent manual browser verification.

This audit demonstrates the importance of combining AI-assisted development with independent engineering review, debugging, and systematic verification.
