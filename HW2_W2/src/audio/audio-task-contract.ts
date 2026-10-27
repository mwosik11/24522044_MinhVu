
export type AudioTaskStatus =
  | 'queued'
  | 'loading'
  | 'decoding'
  | 'ready'
  | 'playing'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type AudioSource =
  | {
      type: 'url';
      url: string;
    }
  | {
      type: 'file';
      file: File;
    };

export interface AudioTask {
  readonly id: string;
  readonly source: AudioSource;
  readonly createdAt: number;
}

export interface AudioTaskState {
  readonly taskId: string;
  readonly status: AudioTaskStatus;
  readonly progress: number;
  readonly error?: string;
}

export interface AudioTaskResult {
  readonly taskId: string;
  readonly buffer: AudioBuffer;
}

export type AudioTaskListener = (
  state: AudioTaskState,
) => void;
