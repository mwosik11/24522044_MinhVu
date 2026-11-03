
import { useEffect, useRef, useState } from "react";
import DrumPad from "./components/DrumPad";
import { DRUM_PADS } from "./data/drumPads";
import {
  disposeAudio,
  playDrumSound,
} from "./audio/drumAudioEngine";
import "./App.css";

function App() {
  const [pressedPads, setPressedPads] = useState([]);
  const timeoutRefs = useRef(new Map());

  const handlePadTrigger = async (pad) => {
    // Play the corresponding drum sound.
    await playDrumSound(pad.soundType);

    // Clear an existing release timer for this pad.
    const existingTimer = timeoutRefs.current.get(pad.id);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Mark the pad as pressed.
    setPressedPads((currentPads) => {
      if (currentPads.includes(pad.id)) {
        return currentPads;
      }

      return [...currentPads, pad.id];
    });

    // Release the pad after a short visual feedback interval.
    const timer = setTimeout(() => {
      setPressedPads((currentPads) =>
        currentPads.filter((id) => id !== pad.id)
      );

      timeoutRefs.current.delete(pad.id);
    }, 120);

    timeoutRefs.current.set(pad.id, timer);
  };

  useEffect(() => {
    return () => {
      // Clear all pending visual release timers.
      timeoutRefs.current.forEach((timer) => {
        clearTimeout(timer);
      });

      timeoutRefs.current.clear();

      // Release the Web Audio resources.
      void disposeAudio();
    };
  }, []);

  return (
    <main className="studio">
      <header className="studio__header">
        <div>
          <p className="studio__eyebrow">PRODUCTION STUDIO</p>
          <h1>Drum Machine</h1>
          <p className="studio__description">
            Create beats with seven interactive drum pads.
          </p>
        </div>

        <div className="studio__status">
          <span className="studio__status-dot" />
          AUDIO STUDIO
        </div>
      </header>

      <section
        className="drum-machine"
        aria-label="Drum machine controls"
      >
        <div className="drum-machine__heading">
          <div>
            <h2>Drum Pads</h2>
            <p>Click a pad to play its sound.</p>
          </div>

          <span className="drum-machine__count">
            {DRUM_PADS.length} PADS
          </span>
        </div>

        <div className="drum-pad-grid">
          {DRUM_PADS.map((pad) => (
            <DrumPad
              key={pad.id}
              pad={pad}
              isPressed={pressedPads.includes(pad.id)}
              onTrigger={handlePadTrigger}
            />
          ))}
        </div>
      </section>

      <footer className="studio__footer">
        <p>REACT 19 · WEB AUDIO API</p>
        <p>7 DRUM SOUNDS</p>
      </footer>
    </main>
  );
}

export default App;
