
import './style.css';

import { FifoAudioTaskQueue } from './audio/audio-task-queue';
import { WebAudioTaskProcessor } from './audio/web-audio-processor';
import { AudioPlayer } from './audio/audio-player';
import type { PlaybackStatus } from './audio/audio-player';
import { AudioVisualizer } from './audio/audio-visualizer';

import type { AudioTaskState } from './audio/audio-task-contract';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Application root element #app was not found.');
}

app.innerHTML = `
  <main class="audio-app">
    <header class="app-header">
      <p class="eyebrow">HW2 · CONCURRENT AUDIO ENGINE</p>
      <h1>Audio Queue</h1>
      <p class="subtitle">
        Load audio files, process them through a FIFO queue,
        and monitor each task.
      </p>
    </header>

    <section class="panel" aria-labelledby="upload-title">
      <h2 id="upload-title">Add audio files</h2>

      <label class="file-picker" for="audio-files">
        <span class="picker-icon" aria-hidden="true">＋</span>
        <span>
          <strong>Select audio files</strong>
          <small>MP3, WAV, OGG and other browser-supported formats</small>
        </span>
      </label>

      <input
        id="audio-files"
        type="file"
        accept="audio/*"
        multiple
      />

      <p id="selection-info" class="selection-info">
        No files selected.
      </p>

      <button id="add-files" type="button" disabled>
        Add to queue
      </button>

      <p id="app-message" class="message" role="status" aria-live="polite">
        Select one or more audio files to begin.
      </p>
    </section>

    <section
      class="panel visualizer-panel"
      aria-labelledby="visualizer-title"
    >
      <div class="section-heading">
        <div>
          <h2 id="visualizer-title">Audio visualizer</h2>
          <p class="section-description">
            Live frequency spectrum powered by the Web Audio API.
          </p>
        </div>

        <span id="visualizer-state" class="count">Idle</span>
      </div>

      <div class="visualizer-frame">
        <canvas
          id="audio-visualizer"
          aria-label="Live audio frequency spectrum"
          role="img"
        ></canvas>
      </div>

      <p
        id="visualizer-caption"
        class="section-description"
        aria-live="polite"
      >
        Select a ready audio task and press Play to visualize its frequency spectrum.
      </p>
    </section>

    <section class="panel" aria-labelledby="queue-title">
      <div class="section-heading">
        <div>
          <h2 id="queue-title">Processing queue</h2>
          <p class="section-description">
            Tasks are processed in FIFO order, subject to the concurrency limit.
          </p>
        </div>

        <span id="task-count" class="count">0 tasks</span>
      </div>

      <div class="queue-summary">
        <div>
          <span class="summary-label">Active tasks</span>
          <strong id="active-count">0</strong>
        </div>

        <div>
          <span class="summary-label">Pending tasks</span>
          <strong id="pending-count">0</strong>
        </div>
      </div>

      <ul id="task-list" class="task-list" aria-label="Audio tasks">
        <li class="empty-state">Your queue is empty.</li>
      </ul>
    </section>
  </main>
`;

const fileInput =
  document.querySelector<HTMLInputElement>('#audio-files')!;

const addButton =
  document.querySelector<HTMLButtonElement>('#add-files')!;

const selectionInfo =
  document.querySelector<HTMLParagraphElement>('#selection-info')!;

const message =
  document.querySelector<HTMLParagraphElement>('#app-message')!;

const taskList =
  document.querySelector<HTMLUListElement>('#task-list')!;

const taskCount =
  document.querySelector<HTMLSpanElement>('#task-count')!;

const activeCount =
  document.querySelector<HTMLElement>('#active-count')!;

const pendingCount =
  document.querySelector<HTMLElement>('#pending-count')!;

const visualizerCanvas =
  document.querySelector<HTMLCanvasElement>('#audio-visualizer')!;

const visualizerState =
  document.querySelector<HTMLSpanElement>('#visualizer-state')!;

const visualizerCaption =
  document.querySelector<HTMLParagraphElement>('#visualizer-caption')!;

const audioContext = new AudioContext();

const processor = new WebAudioTaskProcessor(audioContext);

const taskStates = new Map<string, AudioTaskState>();
const taskNames = new Map<string, string>();
const taskBuffers = new Map<string, AudioBuffer>();
const playbackStates = new Map<string, PlaybackStatus>();
const taskOrder: string[] = [];

let visualizer: AudioVisualizer | null = null;
let disposed = false;

const player = new AudioPlayer(audioContext, (state) => {
  if (state.taskId) {
    playbackStates.set(state.taskId, state.status);
  }

  if (state.status === 'playing') {
    visualizer?.start();
    visualizerState.textContent = 'Live';

    const name = state.taskId
      ? taskNames.get(state.taskId)
      : undefined;

    visualizerCaption.textContent = name
      ? `Visualizing ${name}`
      : 'Visualizing audio in real time.';
  } else if (state.status === 'paused') {
    visualizer?.stop();
    visualizerState.textContent = 'Paused';
    visualizerCaption.textContent = 'Playback is paused.';
  } else {
    visualizer?.stop();
    visualizerState.textContent = 'Idle';

    visualizerCaption.textContent =
      state.status === 'ended'
        ? 'Playback finished. Press Play to listen again.'
        : 'Select a ready audio task and press Play to visualize its frequency spectrum.';
  }

  renderQueue();
});

visualizer = new AudioVisualizer(
  visualizerCanvas,
  player.getAnalyser(),
);

const queue = new FifoAudioTaskQueue(processor, {
  concurrency: 2,

  onTaskStateChange: (state) => {
    taskStates.set(state.taskId, state);

    if (state.status === 'ready' && !taskBuffers.has(state.taskId)) {
      const result = queue.takeResult(state.taskId);

      if (result) {
        taskBuffers.set(state.taskId, result.buffer);
      }
    }

    renderQueue();
  },
});

const terminalStatuses = new Set([
  'ready',
  'completed',
  'cancelled',
  'failed',
]);

fileInput.addEventListener('change', () => {
  const files = Array.from(fileInput.files ?? []);

  selectionInfo.textContent =
    files.length === 0
      ? 'No files selected.'
      : `${files.length} file(s) selected.`;

  addButton.disabled = files.length === 0;
});

addButton.addEventListener('click', () => {
  const files = Array.from(fileInput.files ?? []);

  if (files.length === 0) {
    message.textContent = 'Select at least one audio file.';
    return;
  }

  for (const file of files) {
    const taskId = queue.enqueue({
      type: 'file',
      file,
    });

    taskNames.set(taskId, file.name);
    taskOrder.push(taskId);
  }

  fileInput.value = '';
  selectionInfo.textContent = 'Files added to the queue.';
  addButton.disabled = true;
  message.textContent = `${files.length} file(s) added to the queue.`;

  renderQueue();
});

function renderQueue(): void {
  if (disposed) {
    return;
  }

  const active = queue.getActiveTaskCount();
  const pending = queue.getPendingTaskIds().length;

  activeCount.textContent = String(active);
  pendingCount.textContent = String(pending);

  taskCount.textContent =
    `${taskOrder.length} ${taskOrder.length === 1 ? 'task' : 'tasks'}`;

  if (taskOrder.length === 0) {
    taskList.innerHTML =
      '<li class="empty-state">Your queue is empty.</li>';
    return;
  }

  taskList.replaceChildren();

  for (const taskId of taskOrder) {
    const state = taskStates.get(taskId) ?? queue.getTaskState(taskId);

    if (!state) {
      continue;
    }

    const item = document.createElement('li');
    item.className = 'task-item';

    const details = document.createElement('div');
    details.className = 'task-details';

    const name = document.createElement('strong');
    name.className = 'task-name';
    name.textContent = taskNames.get(taskId) ?? 'Audio file';

    const id = document.createElement('small');
    id.className = 'task-id';
    id.textContent = `Task ${taskId.slice(0, 8)}`;

    details.append(name, id);

    const status = document.createElement('span');
    status.className = `status status-${state.status}`;
    status.textContent = state.status;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const playbackStatus = playbackStates.get(taskId) ?? 'idle';
    const buffer = taskBuffers.get(taskId);

    // Play is available when the task is ready and not already playing or paused.
    if (
      state.status === 'ready' &&
      buffer &&
      (playbackStatus === 'idle' || playbackStatus === 'ended')
    ) {
      const playButton = document.createElement('button');
      playButton.type = 'button';
      playButton.className = 'playback-button';
      playButton.textContent = 'Play';
      playButton.setAttribute(
        'aria-label',
        `Play ${taskNames.get(taskId) ?? 'audio task'}`,
      );

      playButton.addEventListener('click', async () => {
        try {
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          // A click may be followed by another action while resume() is pending.
          if (disposed || taskBuffers.get(taskId) !== buffer) {
            return;
          }

          const previousTaskId = player.getState().taskId;

          if (previousTaskId && previousTaskId !== taskId) {
            playbackStates.set(previousTaskId, 'idle');
          }

          player.play(buffer, taskId);
          message.textContent =
            `Playing ${taskNames.get(taskId) ?? 'audio task'}.`;

          renderQueue();
        } catch (error: unknown) {
          message.textContent =
            error instanceof Error
              ? `Could not play audio: ${error.message}`
              : 'Could not play audio.';
        }
      });

      actions.append(playButton);
    }

    // Pause/Resume and Stop are available for the currently active playback.
    if (
      player.getState().taskId === taskId &&
      (playbackStatus === 'playing' || playbackStatus === 'paused')
    ) {
      const toggleButton = document.createElement('button');
      toggleButton.type = 'button';
      toggleButton.className = 'playback-button';
      toggleButton.textContent =
        playbackStatus === 'playing' ? 'Pause' : 'Resume';

      toggleButton.addEventListener('click', async () => {
        try {
          if (playbackStatus === 'playing') {
            player.pause();
            message.textContent =
              `Paused ${taskNames.get(taskId) ?? 'audio task'}.`;
          } else {
            if (audioContext.state === 'suspended') {
              await audioContext.resume();
            }

            if (disposed || player.getState().taskId !== taskId) {
              return;
            }

            player.resume();
            message.textContent =
              `Resumed ${taskNames.get(taskId) ?? 'audio task'}.`;
          }
        } catch (error: unknown) {
          message.textContent =
            error instanceof Error
              ? `Playback action failed: ${error.message}`
              : 'Playback action failed.';
        }
      });

      actions.append(toggleButton);

      const stopButton = document.createElement('button');
      stopButton.type = 'button';
      stopButton.className = 'playback-button';
      stopButton.textContent = 'Stop';

      stopButton.addEventListener('click', () => {
        player.stop();
        playbackStates.set(taskId, 'idle');
        message.textContent =
          `Stopped ${taskNames.get(taskId) ?? 'audio task'}.`;
        renderQueue();
      });

      actions.append(stopButton);
    }

    if (!terminalStatuses.has(state.status)) {
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = 'cancel-button';
      cancelButton.textContent = 'Cancel';
      cancelButton.setAttribute(
        'aria-label',
        `Cancel ${taskNames.get(taskId) ?? 'audio task'}`,
      );

      cancelButton.addEventListener('click', () => {
        const cancelled = queue.cancel(taskId);

        if (cancelled) {
          message.textContent =
            `Cancelled ${taskNames.get(taskId) ?? 'audio task'}.`;
        }
      });

      actions.append(cancelButton);
    }

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'remove-button';
    removeButton.textContent = 'Remove';
    removeButton.setAttribute(
      'aria-label',
      `Remove ${taskNames.get(taskId) ?? 'audio task'} from queue`,
    );

    removeButton.addEventListener('click', () => {
      const taskName = taskNames.get(taskId) ?? 'Audio task';

      if (player.getState().taskId === taskId) {
        player.stop();
      }

      const removed = queue.remove(taskId);

      if (!removed) {
        message.textContent = `Could not remove ${taskName}.`;
        return;
      }

      taskBuffers.delete(taskId);
      playbackStates.delete(taskId);
      taskStates.delete(taskId);
      taskNames.delete(taskId);

      const taskIndex = taskOrder.indexOf(taskId);

      if (taskIndex !== -1) {
        taskOrder.splice(taskIndex, 1);
      }

      message.textContent = `Removed ${taskName} from the queue.`;
      renderQueue();
    });

    actions.append(removeButton);

    item.append(details, status, actions);

    if (state.error) {
      const error = document.createElement('p');
      error.className = 'task-error';
      error.textContent = state.error;
      item.append(error);
    }

    taskList.append(item);
  }
}

window.addEventListener('pagehide', () => {
  disposed = true;

  queue.dispose();
  player.dispose();
  visualizer?.dispose();

  taskBuffers.clear();
  playbackStates.clear();
  taskStates.clear();
  taskNames.clear();
  taskOrder.length = 0;

  void audioContext.close();
});
