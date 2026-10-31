# AI FAILURE AUDIT — EXERCISE 3

## KRAFTON PUBG VN Live Match Telemetry Widget

**Project:** Lab 03 — Exercise 3  
**Stack:** React 19, Vite, JavaScript ES2024  
**Purpose:** Identify, analyze, and correct potential AI-generated implementation failures in the telemetry widget.

---

## Failure #01: Stale Request Overwriting the Latest Squad Data

### AI-generated failure pattern

An asynchronous request is started when the selected squad changes, but the previous request is not canceled during effect cleanup.

```jsx
useEffect(() => {
  fetchKraftonPubgTelemetry(squadId, {}).then((payload) => {
    setView({
      status: "SUCCESS",
      data: payload,
    });
  });
}, [squadId]);
```

### Problem

When the user switches squads rapidly, an older request may finish after a newer request.

For example:

1. The user selects Cerberus Esports (`ces`).
2. Before the request finishes, the user selects The Expendables (`te`).
3. The user then selects Genius Esports (`ge`).
4. An older response may overwrite the latest squad data.

This creates a race condition and can display incorrect telemetry.

### Engineering fix

Create an `AbortController` inside `useEffect`, pass its signal to the telemetry service, and abort the previous request in the cleanup function.

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetchKraftonPubgTelemetry(squadId, {
    signal: controller.signal,
  });

  return () => controller.abort();
}, [squadId, retryTick]);
```

The cleanup ensures that the previous request is canceled when the selected squad changes or the component unmounts.

### Verification

- Rapidly switched squads in the browser: CES → TE → GE.
- Observed the final interface displaying the latest selected squad.
- No incorrect final squad data or visible stale-request error was observed.

**Limitation:** The current telemetry service simulates requests using `setTimeout`, rather than real HTTP Fetch requests. Therefore, this test does not establish canceled HTTP requests in the Network tab.

---

## Failure #02: Treating AbortError as a Genuine Request Failure

### AI-generated failure pattern

A catch handler handles every rejected request as a genuine error.

```jsx
.catch((err) => {
  setView({
    status: 'ERROR',
    error: err.message,
  });
});
```

### Problem

An `AbortError` is an intentional cancellation, not a satellite connection failure.

When the user changes squads, the previous request is aborted. If the application treats this cancellation as a genuine error, it may incorrectly display the error alert while the new squad is loading.

### Engineering fix

Check the error name before updating the state.

```jsx
.catch((err) => {
  if (err.name === 'AbortError') {
    return;
  }

  setView({
    status: 'ERROR',
    error: err.message,
  });
});
```

This prevents intentional cancellation from triggering the `ERROR` state.

### Verification

- Rapidly switched between CES, TE, and GE.
- Confirmed that the final selected squad loaded successfully.
- No false error alert was observed during the switching test.

---

## Failure #03: Invalid Data Accepted in the SUCCESS State

### AI-generated failure pattern

A state validator checks only whether the `data` property exists.

```js
case STATUS.SUCCESS:
  if (!('data' in state)) {
    throw new Error('SUCCESS state requires data.');
  }
  break;
```

### Problem

This validation accepts an invalid state such as:

```js
{
  status: 'SUCCESS',
  data: null,
}
```

The application may therefore enter `SUCCESS` without valid telemetry data.

This weakens the state-machine contract and can cause rendering problems when the UI accesses squad properties.

### Engineering fix

Require the `data` property to exist and contain a non-null value.

```js
case STATUS.SUCCESS:
  if (!('data' in state) || state.data == null) {
    throw new Error('SUCCESS state requires valid data.');
  }
  break;
```

This makes the state validation stricter and prevents a null payload from being accepted as successful telemetry.

### Verification

- Reviewed and strengthened the state-machine validation.
- Confirmed that the `SUCCESS` state requires non-null data.
- The implementation uses the validation rule to protect state transitions.

---

## Additional Engineering Observation: Simulated Network Requests

The telemetry service currently uses `setTimeout` to simulate a 2.5-second loading period and a 35% packet-loss failure rate.

This is suitable for demonstrating asynchronous loading, cancellation behavior, error handling, and retry recovery.

However, it is not a real HTTP request. Consequently:

- Network throttling does not directly slow down the simulated telemetry timer.
- The Network tab does not show telemetry Fetch/XHR requests.
- Canceled HTTP requests cannot be demonstrated through this simulation.

This limitation should be considered when interpreting the Slow 3G and AbortController verification results.

---

## Final Audit Summary

| Failure / Issue                             | Engineering correction             | Verification status                   |
| ------------------------------------------- | ---------------------------------- | ------------------------------------- |
| Stale request race condition                | AbortController and effect cleanup | Rapid squad switching tested          |
| AbortError incorrectly treated as ERROR     | Explicit AbortError guard          | No false error observed               |
| SUCCESS accepts null data                   | Stricter state validation          | Validation rule reviewed              |
| Simulated request mistaken for HTTP request | Documented simulation limitation   | Confirmed from service implementation |

**Conclusion**

The Exercise 3 implementation applies React effect cleanup, AbortController cancellation, explicit AbortError handling, and state-machine validation to improve reliability.

The telemetry widget was manually tested for squad switching, simulated packet loss, retry recovery, responsive layout at 375px, and CLS.

The current service remains a simulated telemetry implementation rather than a real HTTP integration.
