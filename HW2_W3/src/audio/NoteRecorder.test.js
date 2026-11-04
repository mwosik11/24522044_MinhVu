
import { describe, it, expect, beforeEach, vi } from "vitest";
import { NoteRecorder } from "./NoteRecorder.js";

describe("NoteRecorder", () => {
  let recorder;
  let currentTime;

  beforeEach(() => {
    recorder = new NoteRecorder();
    currentTime = 1000;

    vi.spyOn(performance, "now").mockImplementation(() => currentTime);
  });

  it("should record MIDI, frequency, duration and delta", () => {
    recorder.startRecording();

    recorder.noteOn(69);

    currentTime = 1500;
    recorder.noteOff(69);

    const recording = recorder.getRecording();

    expect(recording).toHaveLength(1);
    expect(recording[0].midi).toBe(69);
    expect(recording[0].freqHz).toBe(440);
    expect(recording[0].durationMs).toBe(500);
    expect(recording[0].deltaMs).toBe(0);
  });

  it("should calculate deltaMs between note starts", () => {
    recorder.startRecording();

    recorder.noteOn(60);

    currentTime = 1200;
    recorder.noteOff(60);

    currentTime = 1400;
    recorder.noteOn(64);

    currentTime = 1700;
    recorder.noteOff(64);

    const recording = recorder.getRecording();

    expect(recording).toHaveLength(2);
    expect(recording[1].deltaMs).toBe(400);
    expect(recording[1].durationMs).toBe(300);
  });

  it("should ignore notes when recording is stopped", () => {
    recorder.startRecording();
    recorder.stopRecording();

    recorder.noteOn(60);
    recorder.noteOff(60);

    expect(recorder.getRecording()).toHaveLength(0);
  });

  it("should ignore duplicate noteOn for the same MIDI", () => {
    recorder.startRecording();

    recorder.noteOn(60);
    currentTime = 1200;
    recorder.noteOn(60);

    currentTime = 1500;
    recorder.noteOff(60);

    expect(recorder.getRecording()).toHaveLength(1);
    expect(recorder.getRecording()[0].durationMs).toBe(500);
  });

  it("should support multiple simultaneous notes", () => {
    recorder.startRecording();

    recorder.noteOn(60);

    currentTime = 1100;
    recorder.noteOn(64);

    currentTime = 1300;
    recorder.noteOff(60);

    currentTime = 1500;
    recorder.noteOff(64);

    const recording = recorder.getRecording();

    expect(recording).toHaveLength(2);
    expect(recording[0].midi).toBe(60);
    expect(recording[1].midi).toBe(64);
    expect(recording[1].deltaMs).toBe(100);
  });

  it("should clear all recorded notes", () => {
    recorder.startRecording();

    recorder.noteOn(60);
    currentTime = 1200;
    recorder.noteOff(60);

    recorder.clear();

    expect(recorder.getRecording()).toHaveLength(0);
  });
});
