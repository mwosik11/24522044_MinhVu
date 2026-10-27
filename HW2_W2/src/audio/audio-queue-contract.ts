
import type {
  AudioTask,
  AudioTaskListener,
  AudioTaskResult,
  AudioTaskState,
} from './audio-task-contract';

export interface AudioQueueOptions {
  readonly concurrency: number;
  readonly onTaskStateChange?: AudioTaskListener;
}

export interface AudioTaskQueue {
  enqueue(source: AudioTask['source']): string;

  cancel(taskId: string): boolean;

  getTaskState(taskId: string): AudioTaskState | undefined;
  
  takeResult(taskId: string): AudioTaskResult | undefined;

  getPendingTaskIds(): readonly string[];

  getActiveTaskCount(): number;

  subscribe(listener: AudioTaskListener): () => void;

  dispose(): void;
}

export interface AudioTaskProcessor {
  process(
    task: AudioTask,
    signal: AbortSignal,
  ): Promise<AudioTaskResult>;
}
