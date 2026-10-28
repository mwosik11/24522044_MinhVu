# AI Failure Audit — HW3: High-Concurrency Flash-Sale E-Commerce Engine

## 1. Purpose

This document records defects and limitations identified during AI-assisted development of the flash-sale application. Each finding includes its potential impact, detection method, corrective action, and verification approach.

The purpose is to demonstrate that AI-generated code was reviewed and tested independently rather than accepted without verification.

## 2. Failure Records

### Failure 1: Reservation Expiration Was Not Enforced Consistently During Checkout

**Component:** `src/inventory/inventory-machine.ts`

**Issue:** An earlier version of the checkout logic could rely on the reservation's existing status without first checking whether its expiration deadline had passed. A reservation could therefore remain eligible for checkout if expiration had not yet been processed.

**Potential impact:** Customers might complete checkout using expired reservations, violating the inventory state-machine rules.

**Detection method:** Code review identified that checking the reservation status alone was insufficient to guarantee that its deadline had not passed.

**Corrective action:** Expired reservations are processed before checkout. Checkout is rejected when the reservation is no longer in the `reserved` state.

**Verification:** Run the inventory unit tests covering expired reservations, checkout after expiration, and duplicate checkout attempts. Confirm that expired reservations cannot be checked out and that stock is not released more than once.

### Failure 2: Reservation Expiration Was Not Immediately Reflected in the UI

**Component:** `src/ui/flash-sale-view.ts`

**Issue:** The inventory state machine could expire a reservation, but the user interface did not automatically update the checkout button and status message when the expiration deadline passed.

**Potential impact:** The interface could display stale reservation information, confusing users about whether their items were still reserved.

**Detection method:** Review of the integration between the inventory state machine and the UI identified that expiration processing and UI updates were not automatically synchronized.

**Corrective action:** A periodic expiration check was added to process due reservations, refresh available stock, and disable checkout when the current reservation expires. The interval is cleared during UI cleanup.

**Verification:** Start the application, reserve an item, wait for the reservation to expire, and confirm that the interface displays the expiration status, disables checkout, and updates the available stock.

### Failure 3: The Concurrency Test Did Not Prove Distributed Concurrency Safety

**Component:** `tests/inventory-machine.test.ts`

**Issue:** Tests using `Promise.allSettled()` can verify that competing reservation requests do not oversell stock in the current JavaScript execution environment. However, when the reservation operation is synchronous and in-memory, these tests do not reproduce simultaneous requests handled by multiple server processes.

**Potential impact:** Treating these tests as proof of production-grade concurrency safety could create a false sense of security. Separate server instances could maintain inconsistent inventory without shared atomic coordination.

**Detection method:** Review the test design and compare the tested execution environment with the assignment's high-concurrency flash-sale scenario.

**Corrective action:** Interpret the existing tests as verification of inventory invariants within a single JavaScript runtime, not as proof of distributed locking. A production implementation would require an atomic inventory operation backed by shared storage, such as a database transaction, conditional update, or appropriate distributed coordination mechanism.

**Verification:** Run the existing inventory tests and confirm that successful reservations never exceed the initial stock in the tested runtime. Record distributed concurrency testing as outside the current in-memory implementation's verified scope.

## 3. Verification Summary

The following checks should be completed before submission:

- [ ] Run `npm run test -- --run`.
- [ ] Run `npm run build`.
- [ ] Manually verify reservation, checkout, reservation expiration, and flash-sale termination.
- [ ] Confirm that cleanup stops timers and removes event listeners.
- [ ] Review the final changes using `git diff` or SourceTree.
- [ ] Ensure that the documented issues and fixes match the actual implementation and test results.

## 4. Conclusion

AI-assisted development accelerated implementation, but the generated logic still required independent review. The identified issues highlight three important engineering concerns: enforcing reservation deadlines, synchronizing application state with the user interface, and distinguishing single-runtime tests from distributed concurrency guarantees.

The current implementation should be evaluated according to the behavior actually verified by its tests. It should not be described as a production-ready distributed flash-sale engine without additional backend, atomicity, and load-testing work.
