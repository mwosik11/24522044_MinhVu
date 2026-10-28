
import type {
  AudioTask,
  AudioTaskResult,
} from './audio-task-contract';

import type {
  AudioTaskProcessor,
} from './audio-queue-contract';

export class WebAudioTaskProcessor implements AudioTaskProcessor {
  private readonly audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }


  async process(
    task: AudioTask,
    signal: AbortSignal,
  ): Promise<AudioTaskResult> {
    this.throwIfAborted(signal);

    let audioData: ArrayBuffer;

    if (task.source.type === 'file') {
      audioData = await task.source.file.arrayBuffer();
    } else {
      const response = await fetch(task.source.url, {
        signal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load audio: HTTP ${response.status}`,
        );
      }

      audioData = await response.arrayBuffer();
    }

    this.throwIfAborted(signal);

    const audioBuffer =
      await this.audioContext.decodeAudioData(audioData);

    // decodeAudioData cannot be cancelled directly.
    // Ignore its result if cancellation occurred during decoding.
    this.throwIfAborted(signal);

    return {
      taskId: task.id,
      buffer: audioBuffer,
    };
  }

  private throwIfAborted(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new DOMException(
        'Audio task was cancelled.',
        'AbortError',
      );
    }
  }
}
