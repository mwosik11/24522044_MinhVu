
import './style.css';

import { FifoAudioTaskQueue } from './audio/audio-task-queue';
import { WebAudioTaskProcessor } from './audio/web-audio-processor';

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

const audioContext = new AudioContext();

const processor = new WebAudioTaskProcessor(audioContext);

const taskStates = new Map<string, AudioTaskState>();
const taskNames = new Map<string, string>();
const taskOrder: string[] = [];

const queue = new FifoAudioTaskQueue(processor, {
  concurrency: 2,
  onTaskStateChange: (state) => {
    taskStates.set(state.taskId, state);
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
      const removed = queue.remove(taskId);

      if (!removed) {
        message.textContent = `Could not remove ${taskName}.`;
        return;
      }

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
  queue.dispose();
  void audioContext.close();
});
