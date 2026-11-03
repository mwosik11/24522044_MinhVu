
let audioContext = null;
let masterGain = null;
let analyser = null;

const getAudioContext = () => {
  if (audioContext) {
    return audioContext;
  }

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported by this browser.");
  }

  audioContext = new AudioContextClass();

  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.7;

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;

  masterGain.connect(analyser);
  analyser.connect(audioContext.destination);

  return audioContext;
};

const createNoiseBuffer = (context, duration = 1) => {
  const bufferSize = Math.floor(
    context.sampleRate * duration
  );

  const buffer = context.createBuffer(
    1,
    bufferSize,
    context.sampleRate
  );

  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

const createOscillator = (
  context,
  frequency,
  type = "sine"
) => {
  const oscillator = context.createOscillator();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(
    frequency,
    context.currentTime
  );

  return oscillator;
};

const createEnvelope = (
  context,
  gainNode,
  peak,
  duration,
  attack = 0.005
) => {
  const now = context.currentTime;
  const gain = gainNode.gain;

  gain.setValueAtTime(0.0001, now);
  gain.linearRampToValueAtTime(peak, now + attack);
  gain.exponentialRampToValueAtTime(
    0.0001,
    now + duration
  );
};

const playKick = (context, output) => {
  const oscillator = createOscillator(
    context,
    150,
    "sine"
  );

  const gain = context.createGain();

  oscillator.frequency.setValueAtTime(
    150,
    context.currentTime
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    45,
    context.currentTime + 0.15
  );

  createEnvelope(context, gain, 1, 0.5);

  oscillator.connect(gain);
  gain.connect(output);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.5);
};

const playSnare = (context, output) => {
  const noise = context.createBufferSource();
  const noiseFilter = context.createBiquadFilter();
  const noiseGain = context.createGain();

  noise.buffer = createNoiseBuffer(context, 0.25);

  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 1000;

  createEnvelope(context, noiseGain, 0.7, 0.2);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(output);

  noise.start();
  noise.stop(context.currentTime + 0.2);

  const oscillator = createOscillator(
    context,
    180,
    "triangle"
  );

  const toneGain = context.createGain();

  createEnvelope(context, toneGain, 0.4, 0.12);

  oscillator.connect(toneGain);
  toneGain.connect(output);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
};

const playHiHat = (context, output, open = false) => {
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  const duration = open ? 0.45 : 0.08;

  noise.buffer = createNoiseBuffer(context, duration);

  filter.type = "highpass";
  filter.frequency.value = 7000;

  createEnvelope(
    context,
    gain,
    0.35,
    duration,
    0.002
  );

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  noise.start();
  noise.stop(context.currentTime + duration);
};

const playTom = (context, output, frequency) => {
  const oscillator = createOscillator(
    context,
    frequency,
    "sine"
  );

  const gain = context.createGain();

  oscillator.frequency.exponentialRampToValueAtTime(
    frequency * 0.55,
    context.currentTime + 0.3
  );

  createEnvelope(context, gain, 0.8, 0.35);

  oscillator.connect(gain);
  gain.connect(output);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.35);
};

const playCrash = (context, output) => {
  const noise = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  noise.buffer = createNoiseBuffer(context, 1.5);

  filter.type = "highpass";
  filter.frequency.value = 5000;

  createEnvelope(context, gain, 0.5, 1.4, 0.01);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(output);

  noise.start();
  noise.stop(context.currentTime + 1.4);
};

export const playDrumSound = async (soundType) => {
  try {
    const context = getAudioContext();

    if (context.state === "suspended") {
      await context.resume();
    }

    switch (soundType) {
      case "kick":
        playKick(context, masterGain);
        break;

      case "snare":
        playSnare(context, masterGain);
        break;

      case "closed-hihat":
        playHiHat(context, masterGain, false);
        break;

      case "open-hihat":
        playHiHat(context, masterGain, true);
        break;

      case "low-tom":
        playTom(context, masterGain, 100);
        break;

      case "mid-tom":
        playTom(context, masterGain, 160);
        break;

      case "crash":
        playCrash(context, masterGain);
        break;

      default:
        console.warn(`Unknown drum sound: ${soundType}`);
        return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to play drum sound:", error);
    return false;
  }
};

export const getAudioAnalyser = () => {
  return analyser;
};

export const disposeAudio = async () => {
  if (!audioContext) {
    return;
  }

  await audioContext.close();

  audioContext = null;
  masterGain = null;
  analyser = null;
};
