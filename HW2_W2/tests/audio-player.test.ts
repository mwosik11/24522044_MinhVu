
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AudioPlayer } from '../src/audio/audio-player';

function createMockSource() {
  return {
    buffer: null as AudioBuffer | null,
    onended: null as (() => void) | null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  } as unknown as AudioBufferSourceNode & {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };
}

function createMockAudioContext() {
  const sources: ReturnType<typeof createMockSource>[] = [];

  const analyser = {
    fftSize: 0,
    connect: vi.fn(),
    disconnect: vi.fn(),
  };

  let mockCurrentTime = 0;

  const context = {
  get currentTime() {
    return mockCurrentTime;
  },
  setMockCurrentTime(value: number) {
    mockCurrentTime = value;
  },
  destination: {},
    createAnalyser: vi.fn(() => analyser),
    createBufferSource: vi.fn(() => {
      const source = createMockSource();
      sources.push(source);
      return source;
    }),
  };

  return {
  context: context as unknown as AudioContext,
  analyser,
  sources,
  setMockCurrentTime: context.setMockCurrentTime,
};
}

function createMockBuffer(duration = 10): AudioBuffer {
  return { duration } as AudioBuffer;
}

describe('AudioPlayer', () => {
  let context: ReturnType<typeof createMockAudioContext>;
  let player: AudioPlayer;

  beforeEach(() => {
    context = createMockAudioContext();
    player = new AudioPlayer(context.context);
  });

  it('creates an analyser with FFT size 512', () => {
    expect(context.context.createAnalyser).toHaveBeenCalledOnce();
    expect(context.analyser.fftSize).toBe(512);
    expect(player.getAnalyser()).toBe(context.analyser);
  });

  it('plays an audio buffer', () => {
    const buffer = createMockBuffer();

    player.play(buffer, 'task-1');

    expect(context.sources).toHaveLength(1);
    expect(context.sources[0].buffer).toBe(buffer);
    expect(context.sources[0].connect).toHaveBeenCalledWith(
      context.analyser,
    );
    expect(context.sources[0].start).toHaveBeenCalledWith(0, 0);
    expect(player.getState()).toEqual({
      taskId: 'task-1',
      status: 'playing',
    });
  });

  it('pauses playback and resumes from the saved offset', () => {
    player.play(createMockBuffer(), 'task-1');

    context.setMockCurrentTime(3);
    player.pause();

    expect(context.sources[0].stop).toHaveBeenCalledOnce();
    expect(player.getState().status).toBe('paused');

    player.resume();

    expect(context.sources).toHaveLength(2);
    expect(context.sources[1].start).toHaveBeenCalledWith(0, 3);
    expect(player.getState().status).toBe('playing');
  });

  it('stops playback and resets the current task', () => {
    player.play(createMockBuffer(), 'task-1');
    player.stop();

    expect(context.sources[0].stop).toHaveBeenCalledOnce();
    expect(player.getState()).toEqual({
      taskId: null,
      status: 'idle',
    });
  });

  it('reports when playback reaches the end', () => {
    player.play(createMockBuffer(), 'task-1');

    const source = context.sources[0];
    const onended = source.onended;

    expect(onended).toBeTypeOf('function');

    if (typeof onended === 'function') {
        onended.call(source, new Event('ended'));
    }

    expect(player.getState()).toEqual({
      taskId: 'task-1',
      status: 'ended',
    });
    expect(source.disconnect).toHaveBeenCalledOnce();
  });

  it('replaces the currently playing audio', () => {
    player.play(createMockBuffer(), 'task-1');
    const firstSource = context.sources[0];

    player.play(createMockBuffer(5), 'task-2');

    expect(firstSource.stop).toHaveBeenCalledOnce();
    expect(firstSource.onended).toBeNull();
    expect(player.getState()).toEqual({
      taskId: 'task-2',
      status: 'playing',
    });
  });

  it('disconnects the analyser when disposed', () => {
    player.dispose();

    expect(context.analyser.disconnect).toHaveBeenCalledOnce();
    expect(player.getState().status).toBe('idle');
  });

  it('does not allow playback after disposal', () => {
    player.dispose();

    expect(() => {
      player.play(createMockBuffer(), 'task-1');
    }).toThrow('AudioPlayer has been disposed.');
  });
});
