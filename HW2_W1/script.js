
// T-05: Keyboard and mouse interaction

const drumPads = document.querySelectorAll(".drum-pad");
const padsByKey = new Map();

drumPads.forEach((pad) => {
  const key = pad.dataset.key?.toLowerCase();

  if (!key || !pad.dataset.sound) {
    console.warn("Drum pad is missing data-key or data-sound:", pad);
    return;
  }

  if (padsByKey.has(key)) {
    console.warn(`Duplicate drum key mapping: ${key}`);
    return;
  }

  padsByKey.set(key, pad);

  // Mouse interaction and native button activation.
  pad.addEventListener("click", () => {
    triggerPad(pad);
  });
});

function triggerPad(pad) {
  if (!pad?.dataset.sound || !window.drumAudioEngine) {
    console.error("Drum pad or audio engine is unavailable.");
    return;
  }

  window.drumAudioEngine.play(pad.dataset.sound);

  pad.classList.add("is-active");

  window.setTimeout(() => {
    pad.classList.remove("is-active");
  }, 100);
}

window.addEventListener("keydown", (event) => {
  // Prevent repeated playback when a key is held.
  if (event.repeat) return;

  // Do not intercept keyboard input intended for editable elements.
  if (
    event.target instanceof Element &&
    event.target.closest(
      'input, textarea, select, [contenteditable="true"]'
    )
  ) {
    return;
  }

  // Ignore modified shortcuts.
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key.toLowerCase();
  const pad = padsByKey.get(key);

  if (!pad) return;

  event.preventDefault();
  triggerPad(pad);
});
