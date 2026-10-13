/* ==================================================
   HW3 — Slice 1: Drift-Free Countdown Engine
   ================================================== */

const countdown = document.querySelector("#countdown");
const countdownStatus = document.querySelector("#countdown-status");

const countdownUnits = {
  days: countdown?.querySelector('[data-unit="days"]'),
  hours: countdown?.querySelector('[data-unit="hours"]'),
  minutes: countdown?.querySelector('[data-unit="minutes"]'),
  seconds: countdown?.querySelector('[data-unit="seconds"]'),
};

const UTC_ISO_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

let countdownTimer = null;

function stopCountdown() {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

function showCountdownStatus(message) {
  if (countdownStatus) {
    countdownStatus.textContent = message;
  }
}

function resetCountdownDisplay() {
  for (const element of Object.values(countdownUnits)) {
    if (element) {
      element.textContent = "--";
    }
  }
}

function updateCountdown(targetTime) {
  const remainingMilliseconds = targetTime - Date.now();

  if (remainingMilliseconds <= 0) {
    stopCountdown();
    resetCountdownDisplay();
    showCountdownStatus("The launch countdown has ended.");
    return;
  }

  const totalSeconds = Math.floor(remainingMilliseconds / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownUnits.days.textContent = String(days);
  countdownUnits.hours.textContent = String(hours).padStart(2, "0");
  countdownUnits.minutes.textContent = String(minutes).padStart(2, "0");
  countdownUnits.seconds.textContent = String(seconds).padStart(2, "0");
}

function initializeCountdown() {
  if (!countdown || !countdownStatus) {
    console.error("Countdown initialization failed: required elements are missing.");
    return;
  }

  const targetTimestamp = countdown.dataset.countdownTarget;

  if (
    !targetTimestamp ||
    !UTC_ISO_PATTERN.test(targetTimestamp)
  ) {
    resetCountdownDisplay();
    showCountdownStatus("Invalid countdown timestamp. Please check the configuration.");
    console.error("Countdown target must be a UTC ISO 8601 timestamp ending in Z.");
    return;
  }

  const targetTime = Date.parse(targetTimestamp);

  if (!Number.isFinite(targetTime)) {
    resetCountdownDisplay();
    showCountdownStatus("Invalid countdown timestamp. Please check the configuration.");
    console.error("Countdown target could not be parsed as a valid date.");
    return;
  }

  if (targetTime <= Date.now()) {
    resetCountdownDisplay();
    showCountdownStatus("The launch countdown has ended.");
    return;
  }

  showCountdownStatus("Countdown is active.");

  updateCountdown(targetTime);

  countdownTimer = setInterval(() => {
    updateCountdown(targetTime);
  }, 1000);
}

initializeCountdown();