
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'ended';

export interface PlaybackState {
  readonly taskId: string | null;
  readonly status: PlaybackStatus;
}

export type PlaybackStateListener = (state: PlaybackState) => void;

export class AudioPlayer {
  private readonly audioContext: AudioContext;
  private readonly analyser: AnalyserNode;
  private readonly onStateChange?: PlaybackStateListener;

  private source: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private currentTaskId: string | null = null;

  private status: PlaybackStatus = 'idle';
  private offset = 0;
  private startedAt = 0;
  private disposed = false;

  constructor(
    audioContext: AudioContext,
    onStateChange?: PlaybackStateListener,
  ) {
    this.audioContext = audioContext;
    this.onStateChange = onStateChange;

    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.connect(audioContext.destination);
  }

  play(buffer: AudioBuffer, taskId: string): void {
    this.assertNotDisposed();

    this.releaseSource();

    this.currentBuffer = buffer;
    this.currentTaskId = taskId;
    this.offset = 0;

    this.startSource();
  }

  pause(): void {
    if (this.disposed || this.status !== 'playing' || !this.source) {
      return;
    }

    if (this.currentBuffer) {
      const elapsed = this.audioContext.currentTime - this.startedAt;
      this.offset = Math.min(
        this.offset + elapsed,
        this.currentBuffer.duration,
      );
    }

    this.releaseSource();
    this.setStatus('paused');
  }

  resume(): void {
    this.assertNotDisposed();

    if (this.status !== 'paused' || !this.currentBuffer) {
      return;
    }

    if (this.offset >= this.currentBuffer.duration) {
      this.offset = 0;
    }

    this.startSource();
  }

  stop(): void {
    if (this.disposed) {
      return;
    }

    this.releaseSource();
    this.currentBuffer = null;
    this.currentTaskId = null;
    this.offset = 0;
    this.setStatus('idle');
  }

  getAnalyser(): AnalyserNode {
    return this.analyser;
  }

  getState(): PlaybackState {
    return {
      taskId: this.currentTaskId,
      status: this.status,
    };
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.releaseSource();
    this.currentBuffer = null;
    this.currentTaskId = null;
    this.offset = 0;
    this.disposed = true;

    this.analyser.disconnect();
    this.status = 'idle';
  }

  private startSource(): void {
    const buffer = this.currentBuffer;

    if (!buffer) {
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.analyser);

    this.source = source;
    this.startedAt = this.audioContext.currentTime;

    source.onended = () => {
      // Ignore callbacks from sources that have already been replaced.
      if (this.source !== source || this.disposed) {
        return;
      }

      this.source = null;
      source.disconnect();
      this.offset = 0;
      this.setStatus('ended');
    };

    source.start(0, this.offset);
    this.setStatus('playing');
  }

  private releaseSource(): void {
    const source = this.source;

    if (!source) {
      return;
    }

    // Prevent a manual stop from being treated as natural completion.
    source.onended = null;
    this.source = null;

    try {
      source.stop();
    } catch {
      // The source may already have stopped.
    }

    source.disconnect();
  }

  private setStatus(status: PlaybackStatus): void {
    this.status = status;

    this.onStateChange?.({
      taskId: this.currentTaskId,
      status,
    });
  }

  private assertNotDisposed(): void {
    if (this.disposed) {
      throw new Error('AudioPlayer has been disposed.');
    }
  }
}
