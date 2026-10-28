import type {
  AudioTask,
  AudioTaskListener,
  AudioTaskResult,
  AudioTaskState,
} from './audio-task-contract';

import type {
  AudioQueueOptions,
  AudioTaskProcessor,
  AudioTaskQueue,
} from './audio-queue-contract';

interface InternalTask {
  readonly task: AudioTask;
  readonly controller: AbortController;
  state: AudioTaskState;
}

export class FifoAudioTaskQueue implements AudioTaskQueue {
  private readonly pending: InternalTask[] = [];
  private readonly tasks = new Map<string, InternalTask>();
  private readonly active = new Set<string>();
  private readonly listeners = new Set<AudioTaskListener>();
  private readonly results = new Map<string, AudioTaskResult>();

  private readonly processor: AudioTaskProcessor;
  private readonly options: AudioQueueOptions;

  private disposed = false;

  constructor(
    processor: AudioTaskProcessor,
    options: AudioQueueOptions,
  ) {
    if (
      !Number.isInteger(options.concurrency) ||
      options.concurrency < 1
    ) {
      throw new RangeError(
        'Concurrency must be a positive integer.',
      );
    }

    this.processor = processor;
    this.options = options;

    if (options.onTaskStateChange) {
      this.listeners.add(options.onTaskStateChange);
    }
  }

  enqueue(source: AudioTask['source']): string {
    this.assertNotDisposed();

    const id = crypto.randomUUID();

    const task: AudioTask = {
      id,
      source,
      createdAt: Date.now(),
    };

    const internalTask: InternalTask = {
      task,
      controller: new AbortController(),
      state: {
        taskId: id,
        status: 'queued',
        progress: 0,
      },
    };

    this.tasks.set(id, internalTask);
    this.pending.push(internalTask);

    this.publish(internalTask.state);
    this.pump();

    return id;
  }

  cancel(taskId: string): boolean {
    if (this.disposed) {
      return false;
    }

    const item = this.tasks.get(taskId);

    if (!item) {
      return false;
    }

    const { status } = item.state;

    if (
      status === 'completed' ||
      status === 'failed' ||
      status === 'cancelled'
    ) {
      return false;
    }

    item.controller.abort();

    const pendingIndex = this.pending.findIndex(
      (pendingItem) => pendingItem.task.id === taskId,
    );

    if (pendingIndex !== -1) {
      this.pending.splice(pendingIndex, 1);
    }

    this.results.delete(taskId);

    this.updateState(item, {
      status: 'cancelled',
      progress: item.state.progress,
    });

    this.pump();

    return true;
  }

  remove(taskId: string): boolean {
    if (this.disposed) {
      return false;
    }

    const item = this.tasks.get(taskId);

    if (!item) {
      return false;
    }

    const { status } = item.state;

    // Cancel queued or processing work before removing its bookkeeping.
    // A ready task is also cancelled so its AudioBuffer is released.
    if (
      status !== 'completed' &&
      status !== 'failed' &&
      status !== 'cancelled'
    ) {
      this.cancel(taskId);
    } else {
      item.controller.abort();
    }

    const pendingIndex = this.pending.findIndex(
      (pendingItem) => pendingItem.task.id === taskId,
    );

    if (pendingIndex !== -1) {
      this.pending.splice(pendingIndex, 1);
    }

    this.results.delete(taskId);
    this.tasks.delete(taskId);

    return true;
  }

  getTaskState(taskId: string): AudioTaskState | undefined {
    const state = this.tasks.get(taskId)?.state;

    return state ? { ...state } : undefined;
  }

  takeResult(taskId: string): AudioTaskResult | undefined {
    if (this.disposed) {
      return undefined;
    }

    const item = this.tasks.get(taskId);

    if (!item || item.state.status !== 'ready') {
      return undefined;
    }

    const result = this.results.get(taskId);

    if (!result) {
      return undefined;
    }

    // A result can only be consumed once.
    this.results.delete(taskId);

    return result;
  }

  getPendingTaskIds(): readonly string[] {
    return this.pending.map((item) => item.task.id);
  }

  getActiveTaskCount(): number {
    return this.active.size;
  }

  subscribe(listener: AudioTaskListener): () => void {
    this.assertNotDisposed();

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    // Cancel queued, processing, and ready tasks.
    for (const item of this.tasks.values()) {
      const { status } = item.state;

      if (
        status === 'queued' ||
        status === 'loading' ||
        status === 'decoding' ||
        status === 'ready'
      ) {
        item.controller.abort();
        this.results.delete(item.task.id);

        item.state = {
          taskId: item.task.id,
          status: 'cancelled',
          progress: item.state.progress,
        };
      }
    }

    // Release queue-held resources.
    this.pending.length = 0;
    this.active.clear();
    this.results.clear();
    this.listeners.clear();
  }

  private pump(): void {
    if (this.disposed) {
      return;
    }

    while (
      this.active.size < this.options.concurrency &&
      this.pending.length > 0
    ) {
      const item = this.pending.shift();

      if (!item || item.controller.signal.aborted) {
        continue;
      }

      this.active.add(item.task.id);

      void this.runTask(item);
    }
  }

  private async runTask(item: InternalTask): Promise<void> {
    const taskId = item.task.id;

    try {
      if (item.controller.signal.aborted || this.disposed) {
        return;
      }

      this.updateState(item, {
        status: 'loading',
        progress: 0,
      });

      const result = await this.processor.process(
        item.task,
        item.controller.signal,
      );

      // Ignore results returned after cancellation or disposal.
      if (
        item.controller.signal.aborted ||
        item.state.status === 'cancelled' ||
        this.disposed
      ) {
        return;
      }

      if (result.taskId !== taskId) {
        throw new Error(
          'Processor returned a mismatched task ID.',
        );
      }

      this.results.set(taskId, {
        taskId,
        buffer: result.buffer,
      });

      this.updateState(item, {
        status: 'ready',
        progress: 100,
      });
    } catch (error: unknown) {
      // Cancellation is not a processing failure.
      if (
        item.controller.signal.aborted ||
        item.state.status === 'cancelled' ||
        this.disposed
      ) {
        return;
      }

      this.updateState(item, {
        status: 'failed',
        progress: item.state.progress,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown audio task error.',
      });
    } finally {
      this.active.delete(taskId);

      if (!this.disposed) {
        this.pump();
      }
    }
  }

  private updateState(
    item: InternalTask,
    update: Omit<AudioTaskState, 'taskId'>,
  ): void {
    item.state = {
      taskId: item.task.id,
      ...update,
    };

    this.publish(item.state);
  }

  private publish(state: AudioTaskState): void {
    if (this.disposed) {
      return;
    }

    for (const listener of this.listeners) {
      try {
        listener({ ...state });
      } catch (error: unknown) {
        console.error(
          'Audio task listener failed:',
          error,
        );
      }
    }
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error(
        'Audio task queue has been disposed.',
      );
    }
  }
}