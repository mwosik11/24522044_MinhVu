
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WebAudioTaskProcessor } from '../src/audio/web-audio-processor';

import type { AudioTask } from '../src/audio/audio-task-contract';

function createTask(
  source: AudioTask['source'],
  id = 'test-task-1',
): AudioTask {
  return {
    id,
    source,
    createdAt: Date.now(),
  };
}

function createAudioBuffer(): AudioBuffer {
  return {} as AudioBuffer;
}

function createMockAudioContext() {
  return {
    decodeAudioData: vi.fn(
      async (_data: ArrayBuffer): Promise<AudioBuffer> =>
        createAudioBuffer(),
    ),
  } as unknown as AudioContext & {
    decodeAudioData: ReturnType<typeof vi.fn>;
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('WebAudioTaskProcessor', () => {
  it('loads audio from a URL and decodes it', async () => {
    const audioData = new ArrayBuffer(8);
    const audioBuffer = createAudioBuffer();
    const audioContext = createMockAudioContext();

    audioContext.decodeAudioData.mockResolvedValue(audioBuffer);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(audioData),
    });

    vi.stubGlobal('fetch', fetchMock);

    const processor = new WebAudioTaskProcessor(audioContext);
    const task = createTask({
      type: 'url',
      url: '/audio/test.mp3',
    });

    const result = await processor.process(
      task,
      new AbortController().signal,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/audio/test.mp3',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );

    expect(audioContext.decodeAudioData).toHaveBeenCalledWith(
      audioData,
    );

    expect(result).toEqual({
      taskId: task.id,
      buffer: audioBuffer,
    });
  });

  it('loads audio from a File and decodes it', async () => {
    const audioData = new ArrayBuffer(8);
    const audioBuffer = createAudioBuffer();
    const audioContext = createMockAudioContext();

    audioContext.decodeAudioData.mockResolvedValue(audioBuffer);

    const file = {
      arrayBuffer: vi.fn().mockResolvedValue(audioData),
    } as unknown as File;

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const processor = new WebAudioTaskProcessor(audioContext);
    const task = createTask({
      type: 'file',
      file,
    });

    const result = await processor.process(
      task,
      new AbortController().signal,
    );

    expect(file.arrayBuffer).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();

    expect(audioContext.decodeAudioData).toHaveBeenCalledWith(
      audioData,
    );

    expect(result).toEqual({
      taskId: task.id,
      buffer: audioBuffer,
    });
  });

  it('throws when the URL request returns an HTTP error', async () => {
    const audioContext = createMockAudioContext();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    vi.stubGlobal('fetch', fetchMock);

    const processor = new WebAudioTaskProcessor(audioContext);
    const task = createTask({
      type: 'url',
      url: '/audio/missing.mp3',
    });

    await expect(
      processor.process(task, new AbortController().signal),
    ).rejects.toThrow('Failed to load audio: HTTP 404');

    expect(audioContext.decodeAudioData).not.toHaveBeenCalled();
  });

  it('propagates audio decoding errors', async () => {
    const audioContext = createMockAudioContext();

    audioContext.decodeAudioData.mockRejectedValue(
      new Error('Invalid audio data'),
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(
        new ArrayBuffer(8),
      ),
    });

    vi.stubGlobal('fetch', fetchMock);

    const processor = new WebAudioTaskProcessor(audioContext);
    const task = createTask({
      type: 'url',
      url: '/audio/invalid.mp3',
    });

    await expect(
      processor.process(task, new AbortController().signal),
    ).rejects.toThrow('Invalid audio data');
  });

  it('rejects immediately if the task is already cancelled', async () => {
    const audioContext = createMockAudioContext();
    const fetchMock = vi.fn();

    vi.stubGlobal('fetch', fetchMock);

    const processor = new WebAudioTaskProcessor(audioContext);
    const task = createTask({
      type: 'url',
      url: '/audio/test.mp3',
    });

    const controller = new AbortController();
    controller.abort();

    await expect(
      processor.process(task, controller.signal),
    ).rejects.toMatchObject({
      name: 'AbortError',
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(audioContext.decodeAudioData).not.toHaveBeenCalled();
  });

  it('does not decode audio if cancellation occurs during loading', async () => {
    const audioContext = createMockAudioContext();
    const controller = new AbortController();

    const fetchMock = vi.fn().mockImplementation(
      async (_url: string, options: { signal: AbortSignal }) => {
        return new Promise((_resolve, reject) => {
          options.signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        });
      },
    );

    vi.stubGlobal('fetch', fetchMock);

    const processor = new WebAudioTaskProcessor(audioContext);
    const task = createTask({
      type: 'url',
      url: '/audio/slow.mp3',
    });

    const processing = processor.process(task, controller.signal);

    controller.abort();

    await expect(processing).rejects.toMatchObject({
      name: 'AbortError',
    });

    expect(audioContext.decodeAudioData).not.toHaveBeenCalled();
  });

  it('does not return a decoded result if cancelled during decoding', async () => {
    const audioContext = createMockAudioContext();
    const controller = new AbortController();

    let resolveDecoding!: (buffer: AudioBuffer) => void;

    audioContext.decodeAudioData.mockImplementation(
      () =>
        new Promise<AudioBuffer>((resolve) => {
          resolveDecoding = resolve;
        }),
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(
        new ArrayBuffer(8),
      ),
    });

    vi.stubGlobal('fetch', fetchMock);

    const processor = new WebAudioTaskProcessor(audioContext);
    const task = createTask({
      type: 'url',
      url: '/audio/test.mp3',
    });

    const processing = processor.process(task, controller.signal);

    await vi.waitFor(() => {
      expect(audioContext.decodeAudioData).toHaveBeenCalledOnce();
    });

    controller.abort();
    resolveDecoding(createAudioBuffer());

    await expect(processing).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
