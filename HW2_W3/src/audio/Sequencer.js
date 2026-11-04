export class Sequencer {
  constructor(synth) {
    this.synth = synth;
    this.isPlaying = false;
    this.playbackSpeed = 1;
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

    try {
      for (const note of notes) {
        const delay = note.deltaMs / this.playbackSpeed;

        if (delay > 0) {
          await this.wait(delay);
        }

        this.synth.noteOn(note.midi);

        await this.wait(note.durationMs / this.playbackSpeed);

        this.synth.noteOff(note.midi);
      }
    } finally {
      this.isPlaying = false;
    }
  }

  wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}