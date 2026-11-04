
const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const BLACK_KEY_PITCH_CLASSES = [1, 3, 6, 8, 10];

const MIDI_START = 21; // A0
const MIDI_END = 108; // C8

export function generatePianoKeys() {
  const keys = [];

  for (let midi = MIDI_START; midi <= MIDI_END; midi++) {
    const pitchClass = midi % 12;
    const octave = Math.floor(midi / 12) - 1;

    const isBlack = BLACK_KEY_PITCH_CLASSES.includes(pitchClass);

    keys.push({
      midi,
      note: `${NOTE_NAMES[pitchClass]}${octave}`,
      isBlack,
      type: isBlack ? "black" : "white",
    });
  }

  return keys;
}
