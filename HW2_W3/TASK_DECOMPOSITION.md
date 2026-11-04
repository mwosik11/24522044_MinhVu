# Task Decomposition – HW2

## Project: 88-Key Polyphonic Piano & Concurrent FIFO Sequencer

## 1. Work Breakdown Structure

| Task ID | Task                     | Description                                                       | Planned Commit |
| ------- | ------------------------ | ----------------------------------------------------------------- | -------------- |
| T01     | Project Initialization   | Initialize React 19, Vite, dependencies, and Git repository.      | Commit 1       |
| T02     | Project Documentation    | Define project rules and task decomposition.                      | Commit 2       |
| T03     | MIDI Key Generation      | Generate 88 piano keys algorithmically from MIDI 21 to 108.       | Commit 3       |
| T04     | Frequency Utilities      | Implement MIDI-to-frequency conversion.                           | Commit 4       |
| T05     | Piano Key Component      | Create reusable, memoized piano key components.                   | Commit 5       |
| T06     | Polyphonic Synthesizer   | Implement Web Audio API oscillator and gain management.           | Commit 6       |
| T07     | FIFO Voice Management    | Limit simultaneous voices to 8 and implement FIFO voice stealing. | Commit 7       |
| T08     | Keyboard Interaction     | Connect mouse and keyboard interactions to piano playback.        | Commit 8       |
| T09     | Note Recording           | Record MIDI notes, frequencies, durations, and timing intervals.  | Commit 9       |
| T10     | Variable-Speed Sequencer | Implement asynchronous replay at 0.5x, 1x, and 2x.                | Commit 10      |
| T11     | Playback Cancellation    | Implement AbortController and audio cleanup.                      | Commit 11      |
| T12     | Testing and Verification | Test piano generation, polyphony, FIFO behavior, and sequencer.   | Commit 12      |
| T13     | AI Failure Audit         | Document verified AI-generated bugs, evidence, and corrections.   | Commit 13      |

## 2. Development Sequence

### Phase 1 – Project Setup

- T01: Initialize the React 19 and Vite project.
- T02: Create project documentation.

### Phase 2 – Piano Architecture

- T03: Generate the 88-key piano using MIDI values.
- T04: Implement frequency conversion utilities.
- T05: Build memoized piano key components.

### Phase 3 – Audio Engine

- T06: Implement the polyphonic synthesizer.
- T07: Implement the 8-voice FIFO voice-stealing mechanism.
- T08: Integrate piano keyboard interactions.

### Phase 4 – Recording and Sequencing

- T09: Implement FIFO note recording.
- T10: Implement variable-speed playback.
- T11: Implement playback cancellation and resource cleanup.

### Phase 5 – Quality Assurance

- T12: Execute tests and verify the required behaviors.
- T13: Document actual AI-generated implementation failures and their fixes.

## 3. Verification Criteria

| Area             | Verification                                                          |
| ---------------- | --------------------------------------------------------------------- |
| Piano Generation | Exactly 88 keys: 52 white and 36 black.                               |
| MIDI Range       | A0 (MIDI 21) to C8 (MIDI 108).                                        |
| Frequency        | Correct MIDI-to-frequency conversion.                                 |
| Polyphony        | Maximum 8 simultaneous voices.                                        |
| FIFO             | The oldest voice is removed when a ninth note is triggered.           |
| Rendering        | Only the affected memoized key should re-render when one key changes. |
| Recording        | Correct MIDI, frequency, duration, and delta time are recorded.       |
| Sequencer        | Playback works at 0.5x, 1x, and 2x.                                   |
| Cancellation     | Stop and unmount cancel playback and silence active voices.           |
| Build            | The project builds successfully.                                      |

## 4. Commit Tracking

- [x] Commit 1 – Project initialization.
- [x] Commit 2 – Project rules and task decomposition.
- [x] Commit 3 – Algorithmic MIDI key generation.
- [x] Commit 4 – MIDI frequency utilities.
- [x] Commit 5 – Memoized piano key component.
- [x] Commit 6 – Polyphonic synthesizer.
- [x] Commit 7 – FIFO voice stealing.
- [x] Commit 8 – Piano keyboard interactions.
- [ ] Commit 9 – FIFO note recording.
- [ ] Commit 10 – Variable-speed sequencer.
- [ ] Commit 11 – Abortable playback and cleanup.
- [ ] Commit 12 – Testing and verification.
- [ ] Commit 13 – AI failure audit.

_Note: Commit tracking must be updated as each milestone is completed. Only document bugs in the AI Failure Audit that were actually observed and verified._
