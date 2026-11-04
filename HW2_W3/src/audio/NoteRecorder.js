
import { midiToFrequency } from "../utils/frequency.js";

export class NoteRecorder {
  constructor() {
    this.queue = [];
    this.pendingNotes = new Map();
    this.lastNoteTime = null;
    this.isRecording = false;
  }

  startRecording() {
    this.queue = [];
    this.pendingNotes.clear();
    this.lastNoteTime = null;
    this.isRecording = true;
  }

  stopRecording() {
    this.isRecording = false;
    this.pendingNotes.clear();
  }

  noteOn(midi) {
    if (!this.isRecording) return;

    const now = performance.now();

    if (this.pendingNotes.has(midi)) return;

    this.pendingNotes.set(midi, {
      startTime: now,
      deltaMs:
        this.lastNoteTime === null
          ? 0
          : Math.max(0, now - this.lastNoteTime),
    });

    this.lastNoteTime = now;
  }

  noteOff(midi) {
    if (!this.isRecording) return;

    const pending = this.pendingNotes.get(midi);

    if (!pending) return;

    const now = performance.now();
    const durationMs = Math.max(0, now - pending.startTime);

    this.queue.push({
      midi,
      freqHz: midiToFrequency(midi),
      durationMs,
      deltaMs: pending.deltaMs,
    });

    this.pendingNotes.delete(midi);
  }

  getRecording() {
    return this.queue.map((note) => ({ ...note }));
  }

  clear() {
    this.queue = [];
    this.pendingNotes.clear();
    this.lastNoteTime = null;
  }
}
