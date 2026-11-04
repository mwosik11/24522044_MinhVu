
export class Sequencer {
  constructor(synth) {
    this.synth = synth;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.abortController = null;
    this.activeNotes = new Set();
  }

  setSpeed(speed) {
    if (![0.5, 1, 2].includes(speed)) {
      throw new Error("Playback speed must be 0.5, 1, or 2.");
    }

    this.playbackSpeed = speed;
  }

  async play(notes) {
    if (this.isPlaying) {
      throw new Error("Sequencer is already playing.");
    }

    if (!Array.isArray(notes) || notes.length === 0) {
      return;
    }

    this.isPlaying = true;
    this.abortController = new AbortController();

    const signal = this.abortController.signal;

    try {
      for (const note of notes) {
        if (signal.aborted) break;

        const delay = note.deltaMs / this.playbackSpeed;

        if (delay > 0) {
          await this.wait(delay, signal);
        }

        if (signal.aborted) break;

        this.synth.noteOn(note.midi);
        this.activeNotes.add(note.midi);

        await this.wait(
          note.durationMs / this.playbackSpeed,
          signal
        );

        this.synth.noteOff(note.midi);
        this.activeNotes.delete(note.midi);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        throw error;
      }
    } finally {
      this.releaseActiveNotes();

      this.isPlaying = false;
      this.abortController = null;
    }
  }

  // Stop playback and release every active synthesizer voice.
  stop() {
    if (this.abortController) {
      this.abortController.abort();
    }

    // Release notes tracked by the sequencer.
    this.releaseActiveNotes();

    // Safety fallback: release every voice in the synthesizer.
    this.synth.stopAll();
  }

  releaseActiveNotes() {
    for (const midi of this.activeNotes) {
      this.synth.noteOff(midi);
    }

    this.activeNotes.clear();
  }

  wait(ms, signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        const error = new Error("Playback aborted.");
        error.name = "AbortError";
        reject(error);
        return;
      }

      const timeoutId = setTimeout(() => {
        signal.removeEventListener("abort", handleAbort);
        resolve();
      }, ms);

      const handleAbort = () => {
        clearTimeout(timeoutId);

        const error = new Error("Playback aborted.");
        error.name = "AbortError";

        reject(error);
      };

      signal.addEventListener("abort", handleAbort, {
        once: true,
      });
    });
  }
}
