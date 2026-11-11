
import { describe, it, expect } from "vitest";
import { calculateRemainingMs } from "./countdown.js";

describe("Countdown Utility", () => {
  it("should calculate remaining time correctly", () => {
    expect(
      calculateRemainingMs(11000, 10000, 0)
    ).toBe(1000);
  });

  it("should account for positive server offset", () => {
    expect(
      calculateRemainingMs(15000, 10000, 2000)
    ).toBe(3000);
  });

  it("should account for negative server offset", () => {
    expect(
      calculateRemainingMs(15000, 10000, -2000)
    ).toBe(7000);
  });

  it("should return zero when target time has passed", () => {
    expect(
      calculateRemainingMs(9000, 10000, 0)
    ).toBe(0);
  });

  it("should return zero when target time equals current time", () => {
    expect(
      calculateRemainingMs(10000, 10000, 0)
    ).toBe(0);
  });

  it("should calculate countdown without server offset", () => {
    expect(
      calculateRemainingMs(20000, 10000)
    ).toBe(10000);
  });

  it("should reject an infinite target timestamp", () => {
    expect(() =>
      calculateRemainingMs(Infinity, 10000, 0)
    ).toThrow(TypeError);
  });

  it("should reject NaN current timestamps", () => {
    expect(() =>
      calculateRemainingMs(10000, NaN, 0)
    ).toThrow(TypeError);
  });

  it("should reject a non-finite server offset", () => {
    expect(() =>
      calculateRemainingMs(10000, 9000, Infinity)
    ).toThrow(TypeError);
  });
});
