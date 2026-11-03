
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

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

  // Clear the visual pressed state of one pad.
  const releasePad = useCallback((padId) => {
    const timer = timeoutRefs.current.get(padId);

    if (timer) {
      clearTimeout(timer);
      timeoutRefs.current.delete(padId);
    }

    setPressedPads((currentPads) =>
      currentPads.filter((id) => id !== padId)
    );
  }, []);

  // Play a drum sound and update its visual state.
  
const handlePadTrigger = useCallback(
  async (pad, autoRelease = true) => {
    await playDrumSound(pad.soundType);

    const existingTimer = timeoutRefs.current.get(pad.id);

    if (existingTimer) {
      clearTimeout(existingTimer);
      timeoutRefs.current.delete(pad.id);
    }

    setPressedPads((currentPads) => {
      if (currentPads.includes(pad.id)) {
        return currentPads;
      }

      return [...currentPads, pad.id];
    });

    if (autoRelease) {
      const timer = setTimeout(() => {
        setPressedPads((currentPads) =>
          currentPads.filter((id) => id !== pad.id)
        );

        timeoutRefs.current.delete(pad.id);
      }, 120);

      timeoutRefs.current.set(pad.id, timer);
    }
  },
  []
);


  // Handle physical keyboard interaction.
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ignore repeated keydown events while a key is held.
      if (event.repeat) {
        return;
      }

      const target = event.target;

      // Do not trigger drum pads while typing in form controls.
      const isTyping =
        target instanceof HTMLElement &&
        (
          target.matches("input, textarea, select") ||
          target.isContentEditable
        );

      if (isTyping) {
        return;
      }

      const pad = DRUM_PADS.find(
        (item) => item.code === event.code
      );

      if (!pad) {
        return;
      }

      event.preventDefault();
      void handlePadTrigger(pad, false);
    };

    const handleKeyUp = (event) => {
      const pad = DRUM_PADS.find(
        (item) => item.code === event.code
      );

      if (!pad) {
        return;
      }

      releasePad(pad.id);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handlePadTrigger, releasePad]);

  // Clean up timers and audio resources on unmount.
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timer) => {
        clearTimeout(timer);
      });

      timeoutRefs.current.clear();

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
            <p>
              Click a pad or press W, A, S, D, J, K, L.
            </p>
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
