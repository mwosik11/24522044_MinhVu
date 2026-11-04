
import { describe, it, expect } from "vitest";
import { generatePianoKeys } from "./piano.js";

describe("generatePianoKeys", () => {
  const keys = generatePianoKeys();

  it("should generate exactly 88 keys", () => {
    expect(keys).toHaveLength(88);
  });

  it("should start at A0 (MIDI 21)", () => {
    expect(keys[0].midi).toBe(21);
    expect(keys[0].note).toBe("A0");
  });

  it("should end at C8 (MIDI 108)", () => {
    expect(keys[87].midi).toBe(108);
    expect(keys[87].note).toBe("C8");
  });

  it("should contain 52 white keys", () => {
    expect(keys.filter((key) => !key.isBlack)).toHaveLength(52);
  });

  it("should contain 36 black keys", () => {
    expect(keys.filter((key) => key.isBlack)).toHaveLength(36);
  });

  it("should have sequential MIDI numbers", () => {
    expect(keys.map((key) => key.midi)).toEqual(
      Array.from({ length: 88 }, (_, index) => index + 21)
    );
  });
});
