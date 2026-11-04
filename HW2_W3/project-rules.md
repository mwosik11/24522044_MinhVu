# Project Rules – HW2: 88-Key Polyphonic Piano & Concurrent FIFO Sequencer

## 1. Project Overview

Build an interactive 88-key polyphonic piano using React 19, Vite, and the Web Audio API.

The application must support:

- Algorithmic generation of 88 piano keys, from A0 to C8.
- Polyphonic audio playback with a maximum of 8 simultaneous voices.
- FIFO voice stealing when a ninth note is played.
- Efficient React rendering using `React.memo`.
- Recording and replaying piano performances.
- Variable playback speeds: 0.5x, 1x, and 2x.
- Playback cancellation using `AbortController`.

## 2. Technical Requirements

- Use React 19 and Vite.
- Use functional React components and Hooks.
- Use the Web Audio API for sound generation.
- Use ES6 `Map` to manage active voices and preserve insertion order.
- Use `React.memo` to isolate piano key rendering.
- Use `AbortController` to cancel asynchronous playback.
- Do not hardcode 88 individual piano key elements.

## 3. Piano Key Generation Rules

- Generate exactly 88 keys algorithmically.
- The MIDI range must cover A0 (MIDI 21) through C8 (MIDI 108).
- The keyboard must contain exactly 52 white keys and 36 black keys.
- Calculate frequency using:

  `frequency = 440 * Math.pow(2, (midi - 69) / 12)`

## 4. Audio and Polyphony Rules

- Support a maximum of 8 simultaneous audio voices.
- Manage active voices using an ES6 `Map`.
- When the voice limit is reached, remove the oldest active voice using FIFO.
- Apply a short gain envelope when stopping an oscillator to prevent audio clicks or pops.
- Ensure that stopped oscillators and associated audio resources are cleaned up correctly.

## 5. React Rendering Rules

- Implement piano keys as reusable components.
- Use `React.memo` for individual piano keys.
- Avoid unnecessary re-rendering of all 88 keys when only one key changes.
- Keep state and event handling appropriately separated.

## 6. Sequencer Rules

- Record note information using the following structure:

  `{ midi, freqHz, durationMs, deltaMs }`

- Preserve FIFO recording order.
- Support playback at 0.5x, 1x, and 2x speed.
- Implement playback cancellation with `AbortController`.
- Stop active audio voices when playback is cancelled or the component unmounts.

## 7. Code Quality

- Use meaningful variable and function names.
- Keep components and utilities focused on individual responsibilities.
- Avoid unnecessary code duplication.
- Handle audio initialization and cleanup carefully.
- Test each feature before integrating it into the next feature.

## 8. Git Rules

- Commit each meaningful development milestone separately.
- Use descriptive commit messages following Conventional Commits.
- Do not combine unrelated features into one commit.
- Keep the project buildable throughout development.
