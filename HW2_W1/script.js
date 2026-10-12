
// T-05: Keyboard and mouse interaction

const drumPads = document.querySelectorAll(".drum-pad");
const padsByKey = new Map();

// Beat Recorder state
// FIFO queue: các sự kiện được thêm theo thứ tự xảy ra
const recordingQueue = [];

let isRecording = false;
let recordingStartTime = null;

const recordingStatus = document.querySelector("#recorder-status");
const recordingList = document.querySelector("#recording-list");

const startButton = document.querySelector("#start-recording");
const stopButton = document.querySelector("#stop-recording");
const clearButton = document.querySelector("#clear-recording");

// Register drum pads
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

  // Mouse interaction
  pad.addEventListener("click", () => {
    triggerPad(pad);
  });
});

// Play a drum sound and record the event if recording is active
function triggerPad(pad) {
  if (!pad?.dataset.sound || !window.drumAudioEngine) {
    console.error("Drum pad or audio engine is unavailable.");
    return;
  }

  window.drumAudioEngine.play(pad.dataset.sound);

  // Record this event only when recording is active
  recordEvent(pad);

  // Visual feedback
  pad.classList.add("is-active");

  window.setTimeout(() => {
    pad.classList.remove("is-active");
  }, 100);
}

// Record one drum event
function recordEvent(pad) {
  if (!isRecording) return;

  const timestamp = Date.now();

  const eventData = {
    key: pad.dataset.key.toUpperCase(),
    sound: pad.querySelector(".pad-name")?.textContent.trim() || "Unknown",
    timestamp: timestamp,
    elapsed: timestamp - recordingStartTime
  };

  // FIFO: append the newest event to the end of the queue
  recordingQueue.push(eventData);

  renderRecordingList();
}

// Display all recorded events
function renderRecordingList() {
  recordingList.replaceChildren();

  recordingQueue.forEach((eventData, index) => {
    const item = document.createElement("li");
    const elapsedSeconds = (eventData.elapsed / 1000).toFixed(2);

    item.textContent =
      `${index + 1}. ${eventData.sound} ` +
      `(${eventData.key}) — ${elapsedSeconds}s`;

    recordingList.appendChild(item);
  });
}

// Start a new recording session
startButton.addEventListener("click", () => {
  if (isRecording) return;

  // Start a fresh session
  recordingQueue.length = 0;
  recordingStartTime = Date.now();
  isRecording = true;

  renderRecordingList();

  recordingStatus.textContent =
    "Recording in progress. Play the drum pads.";

  startButton.disabled = true;
  stopButton.disabled = false;
});

// Stop recording but preserve recorded events
stopButton.addEventListener("click", () => {
  if (!isRecording) return;

  isRecording = false;
  recordingStartTime = null;

  recordingStatus.textContent =
    `Recording stopped. ${recordingQueue.length} event(s) recorded.`;

  startButton.disabled = false;
  stopButton.disabled = true;
});

// Clear all recorded events
clearButton.addEventListener("click", () => {
  isRecording = false;
  recordingStartTime = null;
  recordingQueue.length = 0;

  renderRecordingList();

  recordingStatus.textContent =
    "Recorder ready. No events recorded.";

  startButton.disabled = false;
  stopButton.disabled = true;
});

// Keyboard interaction
window.addEventListener("keydown", (event) => {
  // Prevent repeated playback when a key is held
  if (event.repeat) return;

  // Do not intercept input intended for editable elements
  if (
    event.target instanceof Element &&
    event.target.closest(
      'input, textarea, select, [contenteditable="true"]'
    )
  ) {
    return;
  }

  // Ignore modified shortcuts
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key.toLowerCase();
  const pad = padsByKey.get(key);

  if (!pad) return;

  event.preventDefault();
  triggerPad(pad);
});
