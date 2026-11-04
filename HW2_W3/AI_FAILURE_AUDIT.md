# AI Failure Audit – HW2: 88-Key Polyphonic Piano

## Overview

This document records defects and verification mistakes identified during the AI-assisted development of the 88-Key Polyphonic Piano and Concurrent FIFO Sequencer.

Each issue was investigated using browser testing, Chrome DevTools, Vitest, or direct code inspection. The fixes were applied and verified before being considered resolved.

The audit distinguishes application runtime defects from test-fixture and diagnostic-script defects.

---

## Failure #01: Incomplete Audio Cancellation During Playback

**Category:** Runtime behavior / Audio resource management

**Task Context:** Implement asynchronous sequence playback with AbortController cancellation and a Release All function.

**Observed Behavior:**

During manual testing, clicking Release All while a recording was playing did not reliably stop the currently playing sound.

The playback cancellation path aborted pending asynchronous waits and released notes tracked by the Sequencer. However, this did not provide a complete synth-level safety fallback.

**Root Cause:**

The original `Sequencer.stop()` implementation relied on `releaseActiveNotes()` to release notes tracked by the sequencer. It did not explicitly request the synthesizer to stop all remaining active voices.

This created a gap between cancelling scheduled playback and guaranteeing that the synthesizer was silent.

**Engineering Fix:**

The stop method was strengthened to abort pending playback, release sequencer-tracked notes, and stop all active synthesizer voices when the method is available.

```javascript
stop() {
  if (this.abortController) {
    this.abortController.abort();
  }

  this.releaseActiveNotes();
  this.synth.stopAll?.();
}
```

**Verification Evidence:**

- Manually tested Play Recording followed by Release All while a note was playing.
- Verified that sound stopped and Active Notes returned to zero.
- Tested Stop Playback and subsequent playback.
- The final manual verification passed.

**Final Status:** RESOLVED

---

## Failure #02: Non-Constructible AudioContext Mock

**Category:** Unit testing / Incorrect test double

**Task Context:** Create unit tests for `PolyphonicSynth`, including AudioContext initialization, oscillator creation, frequency configuration, and voice release.

**AI-Generated Testing Mistake:**

The AudioContext mock was implemented using an arrow function as its constructor implementation:

```javascript
vi.fn(() => mockContext);
```

However, the production implementation initializes AudioContext using the `new` operator:

```javascript
this.audioContext = new AudioContextClass();
```

Arrow functions cannot be used as constructors.

**Observed Failure:**

```text
TypeError: () => mockContext is not a constructor

at PolyphonicSynth.initialize
at PolyphonicSynth.noteOn
```

Vitest also generated a warning that the `vi.fn()` mock implementation did not use a function or class.

Five out of six tests failed in the initial test run.

**Root Cause:**

The test double did not reproduce the construction behavior of the real browser AudioContext API.

**Engineering Fix:**

Use a constructible function as the mock implementation:

```javascript
const MockAudioContext = vi.fn(function AudioContextMock() {
  return mockContext;
});

window.AudioContext = MockAudioContext;
```

This allows the production code to call `new AudioContextClass()` while receiving the mocked context.

**Verification Evidence:**

The final full test run reported:

```text
src/audio/PolyphonicSynth.test.js
9 tests passed
```

**Final Status:** RESOLVED

---

## Failure #03: Sequencer Test Double Missing stopAll()

**Category:** Unit testing / Interface mismatch

**Task Context:** Strengthen Sequencer cancellation by adding a synthesizer-level stop fallback.

**Observed Failure:**

After adding the `stopAll()` fallback to `Sequencer.stop()`, two unit tests failed:

```text
FAIL should stop playback immediately

TypeError: this.synth.stopAll is not a function
```

```text
FAIL should not continue playback after abort

TypeError: this.synth.stopAll is not a function
```

**Root Cause:**

The mocked synthesizer used by `Sequencer.test.js` did not implement `stopAll()`, even though the updated Sequencer attempted to call it.

The mock and the updated synthesizer interface were therefore inconsistent.

**Engineering Fix:**

The method invocation was changed to optional chaining:

```javascript
this.synth.stopAll?.();
```

This preserves the fallback when the synthesizer implements `stopAll()` while allowing simpler test doubles that do not expose that method.

A more complete mock can also implement `stopAll()` to mirror the production interface.

**Verification Evidence:**

After the correction:

```text
src/audio/Sequencer.test.js
9 tests passed
```

The complete test suite subsequently reported:

```text
Test Files  6 passed (6)
Tests       40 passed (40)
```

**Final Status:** RESOLVED

---

## Failure #04: Incorrect CSS Class Selectors in Keyboard Verification

**Category:** Verification script / Incorrect DOM selector

**Task Context:** Verify that the algorithmically generated piano contains exactly 88 keys, consisting of 52 white keys and 36 black keys.

**AI-Generated Diagnostic Mistake:**

The initial Console verification script used:

```javascript
key.classList.contains("white");
key.classList.contains("black");
```

However, the actual component used these CSS classes:

```text
piano-key white-key
piano-key black-key
```

**Observed Failure:**

The initial Console output was:

```text
Total: 88
White: 0
Black: 0
```

This incorrectly suggested that the keyboard did not distinguish between white and black keys.

**Root Cause:**

The diagnostic script used class names that did not match the actual JSX implementation.

The application itself was not responsible for this false-negative verification result.

**Engineering Fix:**

The selectors were corrected:

```javascript
console.log("Total:", pianoElements.length);

console.log(
  "White:",
  pianoElements.filter((k) => k.classList.contains("white-key")).length,
);

console.log(
  "Black:",
  pianoElements.filter((k) => k.classList.contains("black-key")).length,
);
```

**Verification Evidence:**

The corrected Console output was:

```text
Total: 88
White: 52
Black: 36
```

**Final Status:** RESOLVED

---

## Additional Investigation: Hardware Keyboard Rollover

During polyphony testing, the physical computer keyboard accepted only six simultaneous key presses.

An independent keyboard event listener was used to monitor simultaneous `keydown` and `keyup` events.

The maximum number of simultaneously held keys reported by the browser was six.

This was identified as a physical keyboard rollover limitation (6-Key Rollover), rather than a defect in the application's eight-voice polyphony implementation.

The polyphony and FIFO algorithms were therefore verified independently using a mocked AudioContext.

The verification results were:

```text
After 8 notes: 8
After 9 notes: 8

Active MIDI:
[61, 62, 63, 64, 65, 66, 67, 68]

Polyphony test: PASS
FIFO test: PASS
Cleanup: PASS
```

No application code change was required to address the physical keyboard limitation.

---

## Final Audit Summary

| No. | Issue                               | Verification Method     | Status   |
| --- | ----------------------------------- | ----------------------- | -------- |
| 01  | Incomplete playback cancellation    | Manual browser testing  | Resolved |
| 02  | Non-constructible AudioContext mock | Vitest                  | Resolved |
| 03  | Missing stopAll() in Sequencer mock | Vitest                  | Resolved |
| 04  | Incorrect white/black CSS selectors | Chrome DevTools Console | Resolved |

### Final Verification

The final automated test execution reported:

- Test files: 6 passed / 6
- Total tests: 40 passed / 40
- PolyphonicSynth tests: 9 passed
- Sequencer tests: 9 passed
- PianoKey tests: 4 passed
- Piano key generation tests: 6 passed
- Frequency utility tests: 6 passed
- NoteRecorder tests: 6 passed

The manual verification also confirmed the 88-key layout, eight-voice polyphony, FIFO voice stealing, React.memo render isolation, recording, playback, and cancellation behavior.

### Conclusion

This development process demonstrated that AI-generated implementation and testing code must be independently verified.

Runtime behavior, test mocks, DOM selectors, audio lifecycle management, and concurrent operations all require direct engineering validation.

The final implementation passed the recorded automated and manual verification checks. All reported issues were investigated and addressed rather than accepted based solely on generated code.
