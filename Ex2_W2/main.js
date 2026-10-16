
import {
  createElement,
  renderToDOM,
  resetCursor,
  useState,
  setRerenderCallback,
} from './reactive-engine.js';

import { setupEventDelegation } from './event-delegation.js';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Root element #app was not found.');
}

// Register delegated listeners once on the stable root.
setupEventDelegation(root);

function TaskApp() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review PR', completed: false },
    { id: 2, title: 'Verify AST', completed: true },
  ]);

  const [filter, setFilter] = useState('ALL');
  const [nextId, setNextId] = useState(3);

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'ACTIVE') {
      return !task.completed;
    }

    if (filter === 'COMPLETED') {
      return task.completed;
    }

    return true;
  });

  function addTask() {
    const input = document.getElementById('new-task-input');
    const title = input?.value.trim();

    if (!title) {
      return;
    }

    setTasks((previousTasks) => [
      ...previousTasks,
      {
        id: nextId,
        title,
        completed: false,
      },
    ]);

    setNextId((previousId) => previousId + 1);
  }

  function toggleTask(taskId) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(taskId) {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    );
  }

  function filterButton(label, value) {
    return createElement(
      'button',
      {
        type: 'button',
        className: filter === value ? 'filter-button active' : 'filter-button',
        'aria-pressed': filter === value,
        onClick: () => setFilter(value),
      },
      label
    );
  }

  const taskItems = visibleTasks.map((task) =>
    createElement(
      'li',
      {
        className: task.completed ? 'task-item completed' : 'task-item',
        key: task.id,
      },
      createElement('label', { className: 'task-label' },
        createElement('input', {
          type: 'checkbox',
          checked: task.completed,
          'aria-label': `Mark ${task.title} as completed`,
          onClick: () => toggleTask(task.id),
        }),
        createElement('span', null, task.title)
      ),
      createElement(
        'button',
        {
          type: 'button',
          className: 'delete-button',
          'aria-label': `Delete ${task.title}`,
          onClick: () => deleteTask(task.id),
        },
        'Delete'
      )
    )
  );

  return createElement(
    'section',
    { className: 'app-container' },

    createElement(
      'header',
      { className: 'app-header' },
      createElement('p', { className: 'eyebrow' }, 'EXERCISE 2'),
      createElement('h1', null, 'Task Manager'),
      createElement(
        'p',
        { className: 'subtitle' },
        'Manage tasks with a reactive state engine.'
      )
    ),

    createElement(
      'form',
      {
        className: 'task-form',
        onSubmit: (event) => {
          event.preventDefault();
          addTask();
        },
      },
      createElement('input', {
        id: 'new-task-input',
        type: 'text',
        placeholder: 'Enter a task...',
        'aria-label': 'New task',
      }),
      createElement(
        'button',
        { type: 'submit', className: 'add-button' },
        'Add Task'
      )
    ),

    createElement(
      'div',
      { className: 'task-summary' },
      createElement('span', null, `Total: ${tasks.length}`),
      createElement(
        'span',
        null,
        `Active: ${tasks.filter((task) => !task.completed).length}`
      ),
      createElement(
        'span',
        null,
        `Completed: ${tasks.filter((task) => task.completed).length}`
      )
    ),

    createElement(
      'nav',
      { className: 'filters', 'aria-label': 'Filter tasks' },
      filterButton('All', 'ALL'),
      filterButton('Active', 'ACTIVE'),
      filterButton('Completed', 'COMPLETED')
    ),

    createElement(
      'ul',
      { className: 'task-list' },
      ...(
        taskItems.length > 0
          ? taskItems
          : [
              createElement(
                'li',
                { className: 'empty-state' },
                'No tasks in this filter.'
              ),
            ]
      )
    )
  );
}

function render() {
  resetCursor();
  const appVNode = TaskApp();
  root.replaceChildren(renderToDOM(appVNode));
}

// Register the render function before the first render.
setRerenderCallback(render);
render();
