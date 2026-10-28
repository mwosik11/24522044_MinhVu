
export class AudioVisualizer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly analyser: AnalyserNode;
  private readonly frequencyData: Uint8Array<ArrayBuffer>;

  private animationFrameId: number | null = null;
  private running = false;
  private disposed = false;

  private readonly handleResize = (): void => {
    if (!this.running) {
      this.drawIdleState();
    }
  };

  constructor(canvas: HTMLCanvasElement, analyser: AnalyserNode) {
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Could not create a 2D canvas rendering context.');
    }

    this.canvas = canvas;
    this.context = context;
    this.analyser = analyser;
    this.frequencyData = new Uint8Array(
      analyser.frequencyBinCount,
    ) as Uint8Array<ArrayBuffer>;

    window.addEventListener('resize', this.handleResize);
    this.drawIdleState();
  }

  start(): void {
    if (this.disposed) {
      throw new Error('AudioVisualizer has been disposed.');
    }

    if (this.running) {
      return;
    }

    this.running = true;
    this.drawFrame();
  }

  stop(): void {
    this.running = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.drawIdleState();
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.disposed = true;
  }

  private prepareCanvas(): { width: number; height: number } {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    const pixelRatio = Math.max(1, window.devicePixelRatio || 1);

    const pixelWidth = Math.round(width * pixelRatio);
    const pixelHeight = Math.round(height * pixelRatio);

    if (
      this.canvas.width !== pixelWidth ||
      this.canvas.height !== pixelHeight
    ) {
      this.canvas.width = pixelWidth;
      this.canvas.height = pixelHeight;
    }

    this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    return { width, height };
  }

  private drawFrame = (): void => {
    this.animationFrameId = null;

    if (!this.running || this.disposed) {
      return;
    }

    const { width, height } = this.prepareCanvas();
    const context = this.context;

    context.clearRect(0, 0, width, height);
    this.analyser.getByteFrequencyData(this.frequencyData);

    const barCount = Math.min(64, this.frequencyData.length);
    const gap = 3;
    const barWidth = Math.max(
      1,
      (width - gap * (barCount - 1)) / barCount,
    );

    const gradient = context.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#4f8cff');
    gradient.addColorStop(0.55, '#7866f5');
    gradient.addColorStop(1, '#45d6c5');

    context.fillStyle = gradient;

    for (let index = 0; index < barCount; index += 1) {
      const dataIndex = Math.floor(
        (index / barCount) * this.frequencyData.length,
      );

      const magnitude = this.frequencyData[dataIndex] / 255;
      const barHeight = Math.max(2, magnitude * height * 0.9);
      const x = index * (barWidth + gap);
      const y = (height - barHeight) / 2;

      context.fillRect(x, y, barWidth, barHeight);
    }

    this.animationFrameId = requestAnimationFrame(this.drawFrame);
  };

  private drawIdleState(): void {
    const { width, height } = this.prepareCanvas();

    this.context.clearRect(0, 0, width, height);
    this.context.fillStyle = 'rgba(120, 145, 180, 0.22)';
    this.context.fillRect(0, Math.floor(height / 2), width, 2);
  }
}
