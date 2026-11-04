
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PolyphonicSynth } from "./PolyphonicSynth.js";

function createMockAudioContext() {
  const oscillator = {
    type: "",
    frequency: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };

  const gainNode = {
    gain: {
      value: 0.3,
      setValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  };

  return {
    state: "running",
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gainNode),
    resume: vi.fn(),
    close: vi.fn(),
    mockOscillator: oscillator,
    mockGainNode: gainNode,
  };
}

describe("PolyphonicSynth", () => {
  let synth;
  let mockContext;

  beforeEach(() => {
    mockContext = createMockAudioContext();

    vi.stubGlobal(
    "window",
        {
        AudioContext: vi.fn(function AudioContextMock() {
                return mockContext;
            }),
        }
    );

    synth = new PolyphonicSynth();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should initialize AudioContext", () => {
    const context = synth.initialize();

    expect(context).toBe(mockContext);
    expect(synth.audioContext).toBe(mockContext);
  });

  it("should create and start an oscillator", () => {
    synth.noteOn(69);

    expect(mockContext.createOscillator).toHaveBeenCalledOnce();
    expect(mockContext.createGain).toHaveBeenCalledOnce();
    expect(mockContext.mockOscillator.start).toHaveBeenCalledOnce();
    expect(synth.activeVoices.has(69)).toBe(true);
  });

  it("should use the correct frequency for MIDI 69", () => {
    synth.noteOn(69);

    expect(
      mockContext.mockOscillator.frequency.setValueAtTime
    ).toHaveBeenCalledWith(440, 0);
  });

  it("should release and remove a voice", () => {
    synth.noteOn(69);
    synth.noteOff(69);

    expect(
      mockContext.mockGainNode.gain.exponentialRampToValueAtTime
    ).toHaveBeenCalledWith(0.0001, 0.04);

    expect(mockContext.mockOscillator.stop).toHaveBeenCalledWith(0.04);
    expect(synth.activeVoices.has(69)).toBe(false);
  });

  it("should ignore noteOff for an inactive voice", () => {
    synth.noteOff(69);

    expect(mockContext.createOscillator).not.toHaveBeenCalled();
  });

  it("should stop all active voices", () => {
    synth.noteOn(60);
    synth.noteOn(64);

    synth.stopAll();

    expect(synth.activeVoices.size).toBe(0);
  });
   
  it("should allow a maximum of 8 simultaneous voices", () => {
    for (let midi = 60; midi < 68; midi++) {
      synth.noteOn(midi);
    }

    expect(synth.activeVoices.size).toBe(8);
  });

  it("should steal the oldest voice when the ninth note is played", () => {
    for (let midi = 60; midi < 68; midi++) {
      synth.noteOn(midi);
    }

    const oldestVoice = synth.activeVoices.get(60);

    synth.noteOn(72);

    expect(synth.activeVoices.size).toBe(8);
    expect(synth.activeVoices.has(60)).toBe(false);
    expect(synth.activeVoices.has(72)).toBe(true);

    expect(oldestVoice.oscillator.stop).toHaveBeenCalledWith(0.04);
  });

  it("should preserve FIFO order when stealing voices", () => {
    for (let midi = 60; midi < 68; midi++) {
      synth.noteOn(midi);
    }

    synth.noteOn(72);

    expect([...synth.activeVoices.keys()]).toEqual([
      61, 62, 63, 64, 65, 66, 67, 72
    ]);
  });
});
