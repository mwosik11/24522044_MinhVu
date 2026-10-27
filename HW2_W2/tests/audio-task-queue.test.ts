import { describe, expect, it, vi } from 'vitest';

import { FifoAudioTaskQueue } from '../src/audio/audio-task-queue';

import type {
  AudioTask,
  AudioTaskResult,
} from '../src/audio/audio-task-contract';

import type { AudioTaskProcessor } from '../src/audio/audio-queue-contract';

function createProcessor(
  handler: (
    task: AudioTask,
    signal: AbortSignal,
  ) => Promise<AudioTaskResult>,
): AudioTaskProcessor {
  return { process: handler };
}

function createResult(taskId: string): AudioTaskResult {
  return {
    taskId,
    buffer: {} as AudioBuffer,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('FifoAudioTaskQueue', () => {
  it('processes tasks in FIFO order when concurrency is one', async () => {
    const processed: string[] = [];

    const processor = createProcessor(async (task) => {
      processed.push(task.id);
      return createResult(task.id);
    });

    const queue = new FifoAudioTaskQueue(processor, {
      concurrency: 1,
    });

    const first = queue.enqueue({
      type: 'url',
      url: '/first.mp3',
    });

    const second = queue.enqueue({
      type: 'url',
      url: '/second.mp3',
    });

    const third = queue.enqueue({
      type: 'url',
      url: '/third.mp3',
    });

    await vi.waitFor(() => {
      expect(queue.getTaskState(third)?.status).toBe('ready');
    });

    expect(processed).toEqual([first, second, third]);

    queue.dispose();
  });

  it('does not exceed the configured concurrency', async () => {
    let active = 0;
    let maximumActive = 0;

    const processor = createProcessor(async (task) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);

      await new Promise((resolve) => setTimeout(resolve, 10));

      active -= 1;
      return createResult(task.id);
    });

    const queue = new FifoAudioTaskQueue(processor, {
      concurrency: 2,
    });

    const ids = Array.from({ length: 5 }, (_, index) =>
      queue.enqueue({
        type: 'url',
        url: `/track-${index}.mp3`,
      }),
    );

    await vi.waitFor(() => {
      expect(queue.getTaskState(ids[4])?.status).toBe('ready');
    });

    expect(maximumActive).toBe(2);
    expect(maximumActive).toBeLessThanOrEqual(2);

    queue.dispose();
  });

  it('cancels a pending task without processing it', async () => {
    const firstTask = deferred<AudioTaskResult>();
    const processed: string[] = [];

    const processor = createProcessor(async (task) => {
      processed.push(task.id);

      if (processed.length === 1) {
        return firstTask.promise;
      }

      return createResult(task.id);
    });

    const queue = new FifoAudioTaskQueue(processor, {
      concurrency: 1,
    });

    const first = queue.enqueue({
      type: 'url',
      url: '/first.mp3',
    });

    const second = queue.enqueue({
      type: 'url',
      url: '/second.mp3',
    });

    await vi.waitFor(() => {
      expect(queue.getTaskState(first)?.status).toBe('loading');
    });

    expect(queue.cancel(second)).toBe(true);
    expect(queue.getTaskState(second)?.status).toBe('cancelled');

    firstTask.resolve(createResult(first));

    await vi.waitFor(() => {
      expect(queue.getTaskState(first)?.status).toBe('ready');
    });

    expect(processed).toEqual([first]);

    queue.dispose();
  });

  it('continues processing after a task fails', async () => {
    const processor = createProcessor(async (task) => {
      if (
        task.source.type === 'url' &&
        task.source.url === '/fail.mp3'
      ) {
        throw new Error('Simulated decoding failure');
      }

      return createResult(task.id);
    });

    const queue = new FifoAudioTaskQueue(processor, {
      concurrency: 1,
    });

    const failed = queue.enqueue({
      type: 'url',
      url: '/fail.mp3',
    });

    const succeeding = queue.enqueue({
      type: 'url',
      url: '/success.mp3',
    });

    await vi.waitFor(() => {
      expect(queue.getTaskState(succeeding)?.status).toBe('ready');
    });

    expect(queue.getTaskState(failed)?.status).toBe('failed');
    expect(queue.getTaskState(succeeding)?.status).toBe('ready');

    queue.dispose();
  });

  it('rejects enqueue after disposal', () => {
    const processor = createProcessor(async (task) =>
      createResult(task.id),
    );

    const queue = new FifoAudioTaskQueue(processor, {
      concurrency: 1,
    });

    queue.dispose();

    expect(() =>
      queue.enqueue({
        type: 'url',
        url: '/track.mp3',
      }),
    ).toThrow('Audio task queue has been disposed.');
  });

  it('passes an abort signal when cancelling an active task', async () => {
    const started = deferred<void>();
    const observedAbort = deferred<void>();

    const processor = createProcessor(
      (_task, signal) =>
        new Promise<AudioTaskResult>((_resolve, reject) => {
          started.resolve();

          signal.addEventListener(
            'abort',
            () => {
              observedAbort.resolve();
              reject(new Error('Aborted'));
            },
            { once: true },
          );
        }),
    );

    const queue = new FifoAudioTaskQueue(processor, {
      concurrency: 1,
    });

    const id = queue.enqueue({
      type: 'url',
      url: '/slow.mp3',
    });

    await started.promise;

    expect(queue.cancel(id)).toBe(true);
    await observedAbort.promise;

    expect(queue.getTaskState(id)?.status).toBe('cancelled');

    queue.dispose();
  });

  it('does not restore state or start queued work after disposal', async () => {
    const firstTask = deferred<AudioTaskResult>();
    const processed: string[] = [];

    const processor = createProcessor(async (task) => {
      processed.push(task.id);

      // Identify the first task by its source, not by its ID.
      // enqueue() starts processing synchronously, so the processor
      // runs before enqueue() has returned the ID to the test.
      if (
        task.source.type === 'url' &&
        task.source.url === '/first.mp3'
      ) {
        // Deliberately ignore AbortSignal and resolve later.
        return firstTask.promise;
      }

      return createResult(task.id);
    });

    const queue = new FifoAudioTaskQueue(processor, {
      concurrency: 1,
    });

    const firstId = queue.enqueue({
      type: 'url',
      url: '/first.mp3',
    });

    const secondId = queue.enqueue({
      type: 'url',
      url: '/second.mp3',
    });

    await vi.waitFor(() => {
      expect(queue.getTaskState(firstId)?.status).toBe('loading');
    });

    queue.dispose();

    expect(queue.getActiveTaskCount()).toBe(0);
    expect(queue.getTaskState(firstId)?.status).toBe('cancelled');
    expect(queue.getTaskState(secondId)?.status).toBe('cancelled');

    firstTask.resolve(createResult(firstId));

    // Wait for the processor continuation and its finally block.
    await vi.waitFor(() => {
      expect(processed).toEqual([firstId]);
      expect(queue.getTaskState(firstId)?.status).toBe('cancelled');
    });

    expect(queue.getActiveTaskCount()).toBe(0);
    expect(queue.takeResult(firstId)).toBeUndefined();
  });

  it('allows a ready result to be taken only once', async () => {
    const processor = createProcessor(async (task) =>
      createResult(task.id),
    );

    const queue = new FifoAudioTaskQueue(processor, {
      concurrency: 1,
    });

    const id = queue.enqueue({
      type: 'url',
      url: '/track.mp3',
    });

    await vi.waitFor(() => {
      expect(queue.getTaskState(id)?.status).toBe('ready');
    });

    expect(queue.takeResult(id)?.taskId).toBe(id);
    expect(queue.takeResult(id)).toBeUndefined();

    queue.dispose();
  });
});