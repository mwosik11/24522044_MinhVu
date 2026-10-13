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

/* ==================================================
   HW3 — Slice 2: Form State Machine
   ================================================== */

const registrationForm = document.querySelector("#registration-form");
const formStatus = document.querySelector("#form-status");
const submitButton = document.querySelector("#submit-button");

const formStates = Object.freeze({
  IDLE: "Idle",
  SUBMITTING: "Submitting",
  SUCCESS: "Success",
  ERROR: "Error",
});

let currentFormState = formStates.IDLE;

const allowedTransitions = {
  [formStates.IDLE]: [formStates.SUBMITTING],
  [formStates.SUBMITTING]: [formStates.SUCCESS, formStates.ERROR],
  [formStates.SUCCESS]: [formStates.IDLE, formStates.SUBMITTING],
  [formStates.ERROR]: [formStates.IDLE, formStates.SUBMITTING],
};

function transitionFormState(nextState) {
  const validTransitions = allowedTransitions[currentFormState];

  if (!validTransitions.includes(nextState)) {
    console.error(
      `Invalid form transition: ${currentFormState} -> ${nextState}`
    );
    return false;
  }

  currentFormState = nextState;
  renderFormState();
  return true;
}

function renderFormState() {
  switch (currentFormState) {
    case formStates.IDLE:
      formStatus.textContent = "Please complete the form to register.";
      submitButton.textContent = "Register";
      break;

    case formStates.SUBMITTING:
      formStatus.textContent = "Processing your registration...";
      submitButton.textContent = "Processing...";
      break;

    case formStates.SUCCESS:
      formStatus.textContent =
        "Demo completed successfully. No registration was sent to a server.";
      submitButton.textContent = "Register";
      break;

    case formStates.ERROR:
      formStatus.textContent =
        "Unable to process the registration. Please try again.";
      submitButton.textContent = "Try Again";
      break;
  }
}

async function processRegistration(formData) {
  /*
   * Demonstration only:
   * Replace this simulated operation with a real API request later.
   * No registration data is currently sent to a server.
   */
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  if (!formData.get("name") || !formData.get("email")) {
    throw new Error("Required registration fields are missing.");
  }
}

registrationForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!registrationForm.reportValidity()) {
    return;
  }

  if (!transitionFormState(formStates.SUBMITTING)) {
    return;
  }

  try {
    const formData = new FormData(registrationForm);

    await processRegistration(formData);

    transitionFormState(formStates.SUCCESS);
  } catch (error) {
    console.error("Registration processing failed:", error);
    transitionFormState(formStates.ERROR);
  }
});