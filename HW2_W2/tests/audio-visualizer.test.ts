
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { AudioVisualizer } from '../src/audio/audio-visualizer';

function createHarness() {
  const gradient = {
    addColorStop: vi.fn(),
  } as unknown as CanvasGradient;

  const context2d = {
    clearRect: vi.fn(),
    createLinearGradient: vi.fn(() => gradient),
    fillRect: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D;

  const canvas = {
    clientWidth: 640,
    clientHeight: 180,
    width: 0,
    height: 0,
    getContext: vi.fn(() => context2d),
  } as unknown as HTMLCanvasElement;

  const analyser = {
    frequencyBinCount: 256,
    getByteFrequencyData: vi.fn((array: Uint8Array) => {
      array.fill(120);
    }),
  } as unknown as AnalyserNode;

  return { canvas, context2d, analyser };
}

describe('AudioVisualizer', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      devicePixelRatio: 1,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 123),
    );

    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('draws an idle baseline when initialized', () => {
    const harness = createHarness();

    new AudioVisualizer(harness.canvas, harness.analyser);

    expect(harness.canvas.getContext).toHaveBeenCalledWith('2d');
    expect(harness.context2d.clearRect).toHaveBeenCalled();
    expect(harness.context2d.fillRect).toHaveBeenCalled();
  });

  it('reads frequency data and starts one animation loop', () => {
    const harness = createHarness();
    const visualizer = new AudioVisualizer(
      harness.canvas,
      harness.analyser,
    );

    visualizer.start();
    visualizer.start();

    expect(
      harness.analyser.getByteFrequencyData,
    ).toHaveBeenCalledOnce();

    expect(
      harness.context2d.createLinearGradient,
    ).toHaveBeenCalledOnce();

    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    visualizer.dispose();
  });

  it('cancels the pending frame when stopped', () => {
    const harness = createHarness();
    const visualizer = new AudioVisualizer(
      harness.canvas,
      harness.analyser,
    );

    visualizer.start();
    visualizer.stop();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
    expect(requestAnimationFrame).toHaveBeenCalledOnce();

    visualizer.dispose();
  });

  it('removes the resize listener and rejects start after disposal', () => {
    const harness = createHarness();
    const visualizer = new AudioVisualizer(
      harness.canvas,
      harness.analyser,
    );

    visualizer.dispose();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function),
    );

    expect(() => visualizer.start()).toThrow(
      'AudioVisualizer has been disposed.',
    );
  });
});
