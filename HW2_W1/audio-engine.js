
// T-04: Independent polyphonic audio engine

const DrumAudioEngine = (() => {
  function play(soundSource) {
    if (typeof soundSource !== "string" || soundSource.trim() === "") {
      console.warn("DrumAudioEngine: Missing sound source.");
      return;
    }

    // Create a new audio instance for each trigger.
    // Separate instances allow overlapping playback.
    const audio = new Audio(soundSource);

    audio.addEventListener(
      "error",
      () => {
        console.error(`Unable to load drum sound: ${soundSource}`);
      },
      { once: true }
    );

    audio.play().catch((error) => {
      console.error("Drum playback failed:", error);
    });
  }

  return Object.freeze({ play });
})();

window.drumAudioEngine = DrumAudioEngine;
