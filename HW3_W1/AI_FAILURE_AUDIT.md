# AI Failure Audit — Homework 3

## Project: Resilient Landing Page

## Failure 1: Insufficient Input Validation

### Problem
The initial AI-generated validation checked only whether the name contained at least three characters. Consequently, an HTML-like payload such as `<img src=x onerror=alert(1)>` passed the name-length check.

### Diagnostic Method
- Manually entered a test payload into the name field.
- Submitted the form with a valid email address.
- Observed that the original validation accepted the payload.
- Reviewed the validation logic in `processRegistration()`.

### Root Cause
The validation rule checked length but did not enforce the intended name format.

### Resolution
- Added a Unicode-aware name validation rule.
- Kept user input out of HTML injection sinks.
- Used `textContent` for displaying messages.
- Re-tested valid Vietnamese names and the HTML-like test payload.

### Verification
Valid input such as `Minh Vũ` was accepted. The test payload was rejected, and no JavaScript execution was observed.

---

## Failure 2: Inconsistent Return Contract

### Problem
The form submission handler attempted to read `result.name` and `result.email`, but the processing function did not return the expected object in the faulty version.

### Diagnostic Method
- Inspected the Chrome DevTools Console.
- Identified a `TypeError` involving an attempt to read the `name` property of `undefined`.
- Traced the error to the registration processing function and its submit event handler.

### Root Cause
The processing function and its caller did not agree on the return-value contract.

### Resolution
Updated `processRegistration()` to return the validated object:

`return { name, email };`

The event handler then accessed the returned properties.

### Verification
Submitting valid name and email values produced a successful demo result, and the Console displayed the validated object without the previous TypeError.

---

## Failure 3: Validation Errors Logged as Unexpected Failures

### Problem
Expected validation failures were logged using `console.error()`, making ordinary invalid input appear as a JavaScript runtime failure in DevTools.

### Diagnostic Method
- Entered an invalid name and submitted the form.
- Inspected the Console and observed repeated red error messages.
- Reviewed the catch block in the form submission handler.

### Root Cause
The error-handling logic did not distinguish expected validation errors from unexpected processing failures.

### Resolution
Introduced a dedicated `ValidationError` class. The catch block now handles validation errors as user-facing form feedback and reserves `console.error()` for unexpected failures.

### Verification
Invalid names displayed a validation message without generating an error log. Valid submissions completed successfully, and unexpected failures remained available for debugging.

---

## Overall Assessment

The audit identified issues in input validation, function contracts, and error handling.

The fixes were verified through browser-based manual tests, Chrome DevTools inspection, and source-code review.

The application remains a front-end demonstration. Registration data is not submitted to a backend server, and client-side validation does not replace server-side validation or security controls.
