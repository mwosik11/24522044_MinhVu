
import { describe, it, expect } from "vitest";
import { midiToFrequency } from "./frequency.js";

describe("midiToFrequency", () => {
  it("should return 440 Hz for A4 (MIDI 69)", () => {
    expect(midiToFrequency(69)).toBe(440);
  });

  it("should return approximately 261.63 Hz for C4 (MIDI 60)", () => {
    expect(midiToFrequency(60)).toBeCloseTo(261.63, 2);
  });

  it("should return approximately 27.50 Hz for A0 (MIDI 21)", () => {
    expect(midiToFrequency(21)).toBeCloseTo(27.50, 2);
  });

  it("should return approximately 4186.01 Hz for C8 (MIDI 108)", () => {
    expect(midiToFrequency(108)).toBeCloseTo(4186.01, 2);
  });

  it("should double the frequency when MIDI increases by 12", () => {
    expect(midiToFrequency(81)).toBeCloseTo(
      midiToFrequency(69) * 2,
      5
    );
  });

  it("should halve the frequency when MIDI decreases by 12", () => {
    expect(midiToFrequency(57)).toBeCloseTo(
      midiToFrequency(69) / 2,
      5
    );
  });
});
