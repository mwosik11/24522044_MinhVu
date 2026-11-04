
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./App.css";

import PianoKey from "./components/PianoKey.jsx";
import { generatePianoKeys } from "./utils/piano.js";
import { PolyphonicSynth } from "./audio/PolyphonicSynth.js";
import { NoteRecorder } from "./audio/NoteRecorder.js";
import { Sequencer } from "./audio/Sequencer.js";

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

const MAX_VOICES = 8;

function App() {
  const pianoKeys = useMemo(() => generatePianoKeys(), []);

  // Audio and recording references
  const synthRef = useRef(null);
  const recorderRef = useRef(null);
  const sequencerRef = useRef(null);

  const heldComputerKeys = useRef(new Set());
  const activeNotesRef = useRef(new Set());

  // React states
  const [activeNotes, setActiveNotes] = useState(() => new Set());

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [recordedNotes, setRecordedNotes] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Initialize instances once
  if (!synthRef.current) {
    synthRef.current = new PolyphonicSynth();
  }

  if (!recorderRef.current) {
    recorderRef.current = new NoteRecorder();
  }

  if (!sequencerRef.current) {
    sequencerRef.current = new Sequencer(synthRef.current);
  }

  // Synchronize React state with active synthesizer voices
  const refreshActiveNotes = useCallback(() => {
    const currentNotes = new Set(
      synthRef.current.activeVoices.keys()
    );

    activeNotesRef.current = currentNotes;
    setActiveNotes(currentNotes);
  }, []);

  // Handle piano key press
  const handleNoteOn = useCallback(
    (midi) => {
      if (isPlaying) return;

      if (activeNotesRef.current.has(midi)) return;

      try {
        // Close the oldest recorded note before FIFO voice stealing
        if (synthRef.current.activeVoices.size >= MAX_VOICES) {
          const oldestMidi = synthRef.current.activeVoices.keys().next().value;

          recorderRef.current.noteOff(oldestMidi);
        }

        synthRef.current.noteOn(midi);

        // Record the note if recording is active
        recorderRef.current.noteOn(midi);

        refreshActiveNotes();
      } catch (error) {
        console.error("Unable to play note:", error);
      }
    },
    [isPlaying, refreshActiveNotes]
  );

  // Handle piano key release
  const handleNoteOff = useCallback(
    (midi) => {
      recorderRef.current.noteOff(midi);
      synthRef.current.noteOff(midi);

      refreshActiveNotes();
    },
    [refreshActiveNotes]
  );

  // Start recording
  const handleStartRecording = useCallback(() => {
    if (isRecording) return;

    // Stop any existing playback
    sequencerRef.current.stop();
    setIsPlaying(false);

    // Release existing notes before recording
    synthRef.current.stopAll();

    heldComputerKeys.current.clear();
    refreshActiveNotes();

    recorderRef.current.clear();
    recorderRef.current.startRecording();

    setRecordedNotes([]);
    setIsRecording(true);
  }, [isRecording, refreshActiveNotes]);

  // Stop recording
  const handleStopRecording = useCallback(() => {
    if (!isRecording) return;

    // Close notes that are still being held
    for (const midi of synthRef.current.activeVoices.keys()) {
      recorderRef.current.noteOff(midi);
    }

    recorderRef.current.stopRecording();

    const notes = [...recorderRef.current.getRecording()];

    setRecordedNotes(notes);
    setIsRecording(false);
  }, [isRecording]);

  // Stop playback
  const handleStopPlayback = useCallback(() => {
    sequencerRef.current.stop();

    setIsPlaying(false);
    refreshActiveNotes();
  }, [refreshActiveNotes]);

  // Play the current recording
  const handlePlayRecording = useCallback(() => {
    if (isRecording || isPlaying) return;

    const notes = [...recorderRef.current.getRecording()];

    if (notes.length === 0) {
      console.warn("No recorded notes available.");
      return;
    }

    // Release manually held notes before playback
    heldComputerKeys.current.clear();
    synthRef.current.stopAll();

    refreshActiveNotes();

    sequencerRef.current.setSpeed(playbackSpeed);

    setRecordedNotes(notes);
    setIsPlaying(true);

    sequencerRef.current
      .play(notes)
      .catch((error) => {
        console.error("Playback error:", error);
      })
      .finally(() => {
        setIsPlaying(false);
        refreshActiveNotes();
      });
  }, [
    isRecording,
    isPlaying,
    playbackSpeed,
    refreshActiveNotes,
  ]);

  // Change playback speed
  const handleSpeedChange = useCallback((event) => {
    const speed = Number(event.target.value);

    sequencerRef.current.setSpeed(speed);
    setPlaybackSpeed(speed);
  }, []);

  // Clear recording
  const handleClearRecording = useCallback(() => {
    if (isRecording || isPlaying) return;

    recorderRef.current.clear();

    setRecordedNotes([]);
  }, [isRecording, isPlaying]);

  // Release all notes and stop current activities
const handleReleaseAll = useCallback(() => {
  // Cancel playback and release sequencer voices.
  sequencerRef.current?.stop();

  // Close notes in the recorder before releasing live voices.
  for (const midi of [...synthRef.current.activeVoices.keys()]) {
    recorderRef.current.noteOff(midi);
  }

  recorderRef.current.stopRecording();

  // Release every remaining synthesizer voice.
  synthRef.current.stopAll();

  heldComputerKeys.current.clear();
  activeNotesRef.current.clear();

  setActiveNotes(new Set());
  setRecordedNotes([...recorderRef.current.getRecording()]);

  setIsRecording(false);
  setIsPlaying(false);
}, []);


  // Computer keyboard interaction
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat || isPlaying) return;

      const key = event.key.toLowerCase();
      const midi = COMPUTER_KEY_MAP[key];

      if (midi === undefined) return;

      event.preventDefault();

      heldComputerKeys.current.add(key);
      handleNoteOn(midi);
    };

    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      const midi = COMPUTER_KEY_MAP[key];

      if (midi === undefined) return;

      // Ignore keyup events for keys that were not pressed by this app
      if (!heldComputerKeys.current.has(key)) return;

      heldComputerKeys.current.delete(key);
      handleNoteOff(midi);
    };

    const handleWindowBlur = () => {
      for (const key of heldComputerKeys.current) {
        const midi = COMPUTER_KEY_MAP[key];

        if (midi !== undefined) {
          handleNoteOff(midi);
        }
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
  }, [handleNoteOn, handleNoteOff, isPlaying]);

  // Refresh active note display during sequencer playback
  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = window.setInterval(() => {
      refreshActiveNotes();
    }, 100);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPlaying, refreshActiveNotes]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      sequencerRef.current?.stop();
      recorderRef.current?.stopRecording();
      synthRef.current?.dispose();
    };
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

      {/* Synthesizer status */}
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

      {/* Recording and playback controls */}
      <section className="transport-panel">
        <div className="transport-heading">
          <h2>Recording & Playback</h2>

          <div className="transport-status">
            <span>
              Recording: <strong>{isRecording ? "Active" : "Inactive"}</strong>
            </span>

            <span>
              Playback: <strong>{isPlaying ? "Playing" : "Stopped"}</strong>
            </span>
          </div>
        </div>

        <div className="transport-controls">
          <button
            type="button"
            className="transport-button record-button"
            onClick={handleStartRecording}
            disabled={isRecording || isPlaying}
          >
            Start Recording
          </button>

          <button
            type="button"
            className="transport-button"
            onClick={handleStopRecording}
            disabled={!isRecording}
          >
            Stop Recording
          </button>

          <button
            type="button"
            className="transport-button play-button"
            onClick={handlePlayRecording}
            disabled={
              isRecording || isPlaying || recordedNotes.length === 0
            }
          >
            Play Recording
          </button>

          <button
            type="button"
            className="transport-button stop-button"
            onClick={handleStopPlayback}
            disabled={!isPlaying}
          >
            Stop Playback
          </button>

          <button
            type="button"
            className="transport-button"
            onClick={handleClearRecording}
            disabled={isRecording || isPlaying}
          >
            Clear Recording
          </button>

          <label className="transport-speed">
            Playback Speed

            <select
              value={playbackSpeed}
              onChange={handleSpeedChange}
              disabled={isPlaying}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
            </select>
          </label>
        </div>

        <div className="recording-info">
          <span>
            Recorded Notes: <strong>{recordedNotes.length}</strong>
          </span>
        </div>
      </section>

      {/* Piano keyboard */}
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

      {/* Instructions */}
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

        <p>
          Use Start Recording to record your performance.
          Use Play Recording to replay it at different speeds.
        </p>
      </section>
    </main>
  );
}

export default App;
