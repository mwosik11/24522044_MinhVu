
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
  getAudioAnalyser,
  playDrumSound,
} from "./audio/drumAudioEngine";

import "./App.css";

function App() {
  const [hitLog, setHitLog] = useState([]);
  const [pressedPads, setPressedPads] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);

  const timeoutRefs = useRef(new Map());
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

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
    const played = await playDrumSound(pad.soundType);
    if (!played){
      return; 
    }
    const hit = {
      id: `${Date.now()}-${Math.random()}`,
      label: pad.label,
      key: pad.key,
      time: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }),
};

setHitLog((currentLog) => [hit, ...currentLog].slice(0, 8));

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
  const releaseAllPads = () => {
    setPressedPads([]);

    timeoutRefs.current.forEach((timer) => {
      clearTimeout(timer);
    });

    timeoutRefs.current.clear();
  };

  const handleKeyDown = (event) => {
    if (event.repeat) {
      return;
    }

    const target = event.target;

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

  const handleWindowBlur = () => {
    releaseAllPads();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      releaseAllPads();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", handleWindowBlur);

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", handleWindowBlur);

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };
}, [handlePadTrigger, releasePad]);

  // Monitor real-time audio levels.
useEffect(() => {
  let isActive = true;
  const frequencyData = new Uint8Array(128);

  const updateAudioLevel = () => {
    if (!isActive) return;

    const analyser = getAudioAnalyser();

    if (!analyser) {
      setAudioLevel(0);
      animationFrameRef.current =
        requestAnimationFrame(updateAudioLevel);
      return;
    }

    analyserRef.current = analyser;

    analyser.getByteFrequencyData(frequencyData);

    const average =
      frequencyData.reduce((sum, value) => sum + value, 0) /
      frequencyData.length;

    setAudioLevel(Math.min(100, Math.round((average / 255) * 100)));

    animationFrameRef.current =
      requestAnimationFrame(updateAudioLevel);
  };

  animationFrameRef.current =
    requestAnimationFrame(updateAudioLevel);

  return () => {
    isActive = false;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
}, []);

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

      <section className="audio-meter" aria-labelledby="audio-meter-title">
      <div className="audio-meter__heading">
        <div>
          <h2 id="audio-meter-title">Audio Level</h2>
          <p>Real-time audio activity</p>
        </div>

        <span className="audio-meter__value">
          {audioLevel}%
        </span>
      </div>

      <div
        className="audio-meter__track"
        role="meter"
        aria-label="Audio level"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={audioLevel}
      >
        <div
          className="audio-meter__fill"
          style={{ width: `${audioLevel}%` }}
        />
      </div>

      <div className="audio-meter__scale">
        <span>LOW</span>
        <span>MEDIUM</span>
        <span>HIGH</span>
      </div>
    </section>


    <section className="hit-log" aria-labelledby="hit-log-title">
      <div className="hit-log__heading">
        <div>
          <h2 id="hit-log-title">Recent Hits</h2>
          <p>Latest drum pad interactions</p>
        </div>

        <span className="hit-log__count">
          {hitLog.length} / 8
        </span>
      </div>

      <output
        className="hit-log__output"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Recent drum pad hits"
      >
        {hitLog.length === 0 ? (
          <span className="hit-log__empty">
            No hits yet. Play a drum pad to get started.
          </span>
        ) : (
          hitLog.map((hit) => (
            <span className="hit-log__entry" key={hit.id}>
              <span className="hit-log__entry-key">
                {hit.key}
              </span>

              <span className="hit-log__entry-label">
                {hit.label}
              </span>

              <time className="hit-log__entry-time">
                {hit.time}
              </time>
            </span>
          ))
        )}
      </output>
    </section>


      <footer className="studio__footer">
        <p>REACT 19 · WEB AUDIO API</p>
        <p>7 DRUM SOUNDS</p>
      </footer>
    </main>
  );
}

export default App;
