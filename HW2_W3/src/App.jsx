
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import PianoKey from "./components/PianoKey.jsx";
import { generatePianoKeys } from "./utils/piano.js";
import { PolyphonicSynth } from "./audio/PolyphonicSynth.js";

const COMPUTER_KEY_MAP = {
  a: 60, // C4
  w: 61, // C#4
  s: 62, // D4
  e: 63, // D#4
  d: 64, // E4
  f: 65, // F4
  t: 66, // F#4
  g: 67, // G4
  y: 68, // G#4
  h: 69, // A4
  u: 70, // A#4
  j: 71, // B4
};

function App() {
  const pianoKeys = useMemo(() => generatePianoKeys(), []);
  const synthRef = useRef(null);
  const heldComputerKeys = useRef(new Set());

  const [activeNotes, setActiveNotes] = useState(() => new Set());

  if (!synthRef.current) {
    synthRef.current = new PolyphonicSynth();
  }

  
const activeNotesRef = useRef(new Set());

const handleNoteOn = useCallback((midi) => {
  if (activeNotesRef.current.has(midi)) return;

  try {
    synthRef.current.noteOn(midi);

    // Read the actual active voices after FIFO processing.
    const currentNotes = new Set(synthRef.current.activeVoices.keys());

    activeNotesRef.current = currentNotes;
    setActiveNotes(currentNotes);
  } catch (error) {
    console.error("Unable to play note:", error);
  }
}, []);

const handleNoteOff = useCallback((midi) => {
  synthRef.current.noteOff(midi);

  const currentNotes = new Set(synthRef.current.activeVoices.keys());

  activeNotesRef.current = currentNotes;
  setActiveNotes(currentNotes);
}, []);


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat) return;

      const midi = COMPUTER_KEY_MAP[event.key.toLowerCase()];

      if (midi === undefined) return;

      event.preventDefault();
      heldComputerKeys.current.add(event.key.toLowerCase());
      handleNoteOn(midi);
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      const midi = COMPUTER_KEY_MAP[key];

      if (midi === undefined) return;

      heldComputerKeys.current.delete(key);
      handleNoteOff(midi);
    };

    const handleWindowBlur = () => {
      for (const key of heldComputerKeys.current) {
        const midi = COMPUTER_KEY_MAP[key];
        if (midi !== undefined) handleNoteOff(midi);
      }

      heldComputerKeys.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [handleNoteOn, handleNoteOff]);

  useEffect(() => {
    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  const handleReleaseAll = useCallback(() => {
    synthRef.current.stopAll();
    activeNotesRef.current.clear();
    heldComputerKeys.current.clear();
    setActiveNotes(new Set());
  }, []);

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">HW2 · Web Audio API</p>
          <h1>88-Key Polyphonic Piano</h1>
          <p className="subtitle">
            Interactive piano with polyphonic sound generation
          </p>
        </div>

        <button
          type="button"
          className="release-button"
          onClick={handleReleaseAll}
        >
          Release All
        </button>
      </header>

      <section className="status-panel">
        <div>
          <span className="status-label">Active Notes</span>
          <strong>{activeNotes.size}</strong>
        </div>

        <div>
          <span className="status-label">Keyboard Range</span>
          <strong>A0 – C8</strong>
        </div>

        <div>
          <span className="status-label">Polyphony Limit</span>
          <strong>8 Voices</strong>
        </div>
      </section>

      <section className="keyboard-section">
        <div className="keyboard-heading">
          <h2>Piano Keyboard</h2>
          <span>88 Keys</span>
        </div>

        <div className="piano-scroll">
          <div className="piano-keyboard">
            {pianoKeys.map((key) => (
              <PianoKey
                key={key.midi}
                midi={key.midi}
                note={key.note}
                isBlack={key.isBlack}
                isActive={activeNotes.has(key.midi)}
                onNoteOn={handleNoteOn}
                onNoteOff={handleNoteOff}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="instructions">
        <h2>How to Play</h2>
        <p>
          Click or touch a piano key and hold it to play a note.
          Release the key to stop the sound.
        </p>
        <p>
          Computer keyboard: A, W, S, E, D, F, T, G, Y, H, U, J
          (C4 – B4).
        </p>
      </section>
    </main>
  );
}

export default App;
