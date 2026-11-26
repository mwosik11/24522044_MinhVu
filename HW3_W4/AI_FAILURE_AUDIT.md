# AI_FAILURE_AUDIT.md — Lab 4 HW3: Esports Fair-Play Appeal Tribunal

Architecture post-mortem of defects found in AI-generated code — the lab's slide contracts
(themselves AI-generated, per the course motto "Generate with AI. Verify with Engineering.")
and AI-written tests — plus two risks caught in design review. Every item has a fix and,
where possible, a regression test.

| # | Source | Area | Severity | Caught by | Regression test / evidence |
|---|---|---|---|---|---|
| 1 | Slide 33 contract | Routing | High | Spec review | `opens a dossier through the dynamic route…` |
| 2 | Slide 14 `FormContext` | Accessibility | High | Testing Library | `gives every field its own id` |
| 3 | Slide 33 `useAppealSlaTimer` | Timer / memory | High | Vitest fake timers | `jumps to the correct value…`, `removes its listener…` |
| 4 | AI-written test | Test design | Medium | Failing test output | `docs/evidence/04-act-batching-failure.png` |
| 5 | Design review | Security | High | supertest | `rejects appeals after the SLA deadline (410)` |
| 6 | Design review | Data race | High | Vitest + DevTools | `aborts the previous dossier request…`, `docs/evidence/06-network-canceled.png` |

---

## 1. Hard-coded dossier routes contradict the specification

**AI output (slide 33):**
```jsx
<Route path="/dossier/himass" element={<DossierView user="Himass" />} />
<Route path="/dossier/tanvuu" element={<DossierView user="TanVuu" />} />
```
**Problem:** the requirement is dynamic routing via `/dossier/:playerID`. Every new player
would need a code change and a deploy; unknown ids fall through to the generic 404 with no
dossier-specific message.

**Fix:** one route `dossier/:playerID` + `useParams()`, data loaded by `useDossier(playerID)`,
a dedicated "Dossier not found" state for API 404s, and a nested `appeal` child route
rendered through `<Outlet>`.

---

## 2. One `useId()` shared by every form field

**AI output (slide 14):**
```jsx
export function FormProvider({ values, rules, children }) {
  const errors = evaluateErrors(values, rules);
  const fieldId = useId();               // one id for the whole form
  return <FormContext.Provider value={{ errors, isValid, fieldId }}>…
```
**Problem:** every field consuming `fieldId` renders the same `id`, so `<label htmlFor>`
points to the first input only and `aria-describedby` reads the wrong error message —
a WCAG 1.3.1 / 4.1.2 failure invisible to sighted testing.

**Fix:** keep the synchronous evaluation in the provider (that part was right) but call
`useId()` inside each field (`useFieldA11y`) and derive `-hint` / `-error` ids from it.

---

## 3. Visibility listener without cleanup and an undefined resync

**AI output (slide 33):**
```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') resyncTimerWithServer();
});
```
**Problems:**
- Registered at module/effect level with no `removeEventListener` → one extra listener per
  mount (StrictMode mounts twice in dev); listeners keep firing after leaving the page.
- `resyncTimerWithServer` is never defined; typical AI completions pair it with a
  `setInterval(() => setSeconds(s => s - 1), 1000)` counter, which drifts because each
  late tick is accumulated and background tabs throttle timers to ≥ 1 s or worse.

**Fix:** `useAppealSlaTimer` stores only `now` and recomputes
`deadline − (Date.now() + offsetMs)`; one `setTimeout` aligned to the next second;
listener added and removed in the same effect; `useEffectEvent` calls the latest
`onResync`, which re-measures the server offset via `GET /api/time`.

---

## 4. AI-written test reported drift that did not exist

**AI output:**
```js
act(() => vi.advanceTimersByTime(HOUR));
expect(result.current.remainingMs).toBe(HOUR);
```
**Symptom:** `expected 7199000 to be 3600000` and an "expiry" test stuck at 1000 ms —
it looked as if the timer drifted by 59 minutes.

**Root cause:** a single `act()` batches state updates until the callback returns. The hook
schedules the *next* `setTimeout` only after React re-renders, so only the first tick ever
fired inside that `act`.

**Fix:** an `advance(ms, step)` helper that runs one `act()` per second, matching how a
browser renders between ticks. Lesson: a red test is evidence about the *test* as much as
the code — reproduce in the browser before "fixing" production code.

---

## 5. Deadline enforced only by the UI

**Risk:** disabling the submit button when the countdown reaches zero is cosmetic. A user can
change the OS clock, call the API with curl, or keep a stale tab open.

**Fix:** the server checks `Date.now() > appealDeadline` and answers **410 Gone** before
validating the body; the client measures its offset against the server clock
(`useServerClock`, RTT/2 compensation) so the countdown matches the server's decision.

---

## 6. Stale dossier shown after a fast player switch

**Risk:** clicking Himass then TanVuu on a slow network lets Himass's response arrive last
and overwrite TanVuu's page; for one render after a route change the old player's data is
still in state.

**Fix:** `useDossier` aborts the previous request in the effect cleanup and ignores
`AbortError`; it also tags state with the `playerId` it belongs to and returns `loading`
when the tag does not match the current route param. Verified under DevTools "Slow 3G":
earlier requests show `(canceled)`.

---

## Lessons → prompt rules
1. Re-read the requirement after reading the AI's code: slide code contradicted the slide spec.
2. Ask "where is this listener removed?" for every `addEventListener` the AI writes.
3. Timers must be derived from absolute timestamps; never accept `s - 1` counters.
4. Security rules (deadlines, validation) must run on the server — share them, don't copy them.