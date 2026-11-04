
import { midiToFrequency } from "../utils/frequency.js";

export class PolyphonicSynth {
  constructor() {
    this.audioContext = null;
    this.activeVoices = new Map();
  }

  initialize() {
    if (!this.audioContext) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported.");
      }

      this.audioContext = new AudioContextClass();
    }

    return this.audioContext;
  }

  noteOn(midi) {
    const context = this.initialize();

    if (context.state === "suspended") {
      context.resume();
    }

    // Prevent duplicate active voices for the same MIDI note.
    if (this.activeVoices.has(midi)) {
      this.noteOff(midi);
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    const frequency = midiToFrequency(midi);
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(
      0.3,
      now + 0.02
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start(now);

    this.activeVoices.set(midi, {
      oscillator,
      gainNode,
      frequency,
    });
  }

  noteOff(midi) {
    const voice = this.activeVoices.get(midi);

    if (!voice || !this.audioContext) {
      return;
    }

    const now = this.audioContext.currentTime;
    const gain = voice.gainNode.gain;

    gain.cancelScheduledValues(now);

    const currentGain = Math.max(gain.value, 0.0001);
    gain.setValueAtTime(currentGain, now);

    gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.04
    );

    voice.oscillator.stop(now + 0.04);

    this.activeVoices.delete(midi);
  }

  stopAll() {
    for (const midi of [...this.activeVoices.keys()]) {
      this.noteOff(midi);
    }
  }

  dispose() {
    this.stopAll();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
