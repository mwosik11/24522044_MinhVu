import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Sequencer } from "./Sequencer.js";

describe("Sequencer", () => {
  let synth;
  let sequencer;

  beforeEach(() => {
    vi.useFakeTimers();

    synth = {
      noteOn: vi.fn(),
      noteOff: vi.fn(),
    };

    sequencer = new Sequencer(synth);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should play notes in FIFO order", async () => {
    const notes = [
      { midi: 60, deltaMs: 0, durationMs: 100 },
      { midi: 64, deltaMs: 200, durationMs: 100 },
    ];

    const playback = sequencer.play(notes);

    await vi.runAllTimersAsync();
    await playback;

    expect(synth.noteOn.mock.calls).toEqual([[60], [64]]);
    expect(synth.noteOff.mock.calls).toEqual([[60], [64]]);
  });

  it("should support 0.5x playback speed", async () => {
    sequencer.setSpeed(0.5);

    const notes = [
      { midi: 60, deltaMs: 0, durationMs: 100 },
    ];

    const playback = sequencer.play(notes);

    await vi.advanceTimersByTimeAsync(199);
    expect(synth.noteOff).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await playback;

    expect(synth.noteOff).toHaveBeenCalledWith(60);
  });

  it("should support 1x playback speed", async () => {
    sequencer.setSpeed(1);

    const playback = sequencer.play([
      { midi: 60, deltaMs: 0, durationMs: 100 },
    ]);

    await vi.advanceTimersByTimeAsync(100);
    await playback;

    expect(synth.noteOff).toHaveBeenCalledWith(60);
  });

  it("should support 2x playback speed", async () => {
    sequencer.setSpeed(2);

    const playback = sequencer.play([
      { midi: 60, deltaMs: 0, durationMs: 100 },
    ]);

    await vi.advanceTimersByTimeAsync(49);
    expect(synth.noteOff).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    await playback;

    expect(synth.noteOff).toHaveBeenCalledWith(60);
  });

  it("should reject unsupported playback speeds", () => {
    expect(() => sequencer.setSpeed(3)).toThrow(
      "Playback speed must be 0.5, 1, or 2."
    );
  });

  it("should ignore an empty recording", async () => {
    await expect(sequencer.play([])).resolves.toBeUndefined();

    expect(synth.noteOn).not.toHaveBeenCalled();
    expect(synth.noteOff).not.toHaveBeenCalled();
  });

  it("should prevent concurrent playback", async () => {
  const playback = sequencer.play([
    { midi: 60, deltaMs: 0, durationMs: 100 },
  ]);

    await expect(
        sequencer.play([
        { midi: 64, deltaMs: 0, durationMs: 100 },
        ])
    ).rejects.toThrow("Sequencer is already playing.");

    await vi.runAllTimersAsync();
    await playback;
    });
});