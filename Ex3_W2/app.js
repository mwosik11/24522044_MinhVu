
import { STATUS } from './state-machine.js';
import { createDataLoader } from './data-loader.js';

const vietnamesePosts = [
  {
    id: 1,
    title: 'Học tập hiệu quả với phương pháp phù hợp',
    body: 'Lập kế hoạch học tập rõ ràng giúp bạn quản lý thời gian tốt hơn, tập trung vào mục tiêu và duy trì tiến độ mỗi ngày.',
  },
  {
    id: 2,
    title: 'Cách quản lý thời gian hiệu quả',
    body: 'Hãy ưu tiên những công việc quan trọng, chia nhiệm vụ lớn thành các bước nhỏ và dành thời gian nghỉ ngơi hợp lý.',
  },
  {
    id: 3,
    title: 'Vai trò của công nghệ trong giáo dục',
    body: 'Công nghệ giúp người học tiếp cận tài liệu nhanh chóng, trao đổi kiến thức thuận tiện và chủ động hơn trong quá trình học tập.',
  },
  {
    id: 4,
    title: 'Phát triển kỹ năng làm việc nhóm',
    body: 'Lắng nghe ý kiến, phân chia trách nhiệm rõ ràng và thường xuyên trao đổi giúp các thành viên phối hợp hiệu quả hơn.',
  },
  {
    id: 5,
    title: 'Xây dựng thói quen học tập mỗi ngày',
    body: 'Duy trì thời gian học cố định, ôn tập kiến thức thường xuyên và đánh giá tiến độ sẽ giúp bạn cải thiện kết quả lâu dài.',
  },
];


const feedElement = document.querySelector('#feed');

if (!feedElement) {
  throw new Error('Feed container was not found.');
}

/**
 * Creates a button with a delegated action identifier.
 */
function createButton(label, action, secondary = false) {
  const button = document.createElement('button');

  button.type = 'button';
  button.className = secondary
    ? 'button secondary'
    : 'button';

  button.textContent = label;
  button.dataset.action = action;

  return button;
}

/**
 * Renders the initial IDLE state.
 */
function renderIdle() {
  const panel = document.createElement('div');
  panel.className = 'status-panel';

  const title = document.createElement('h2');
  title.textContent = 'Ready to load';

  const description = document.createElement('p');
  description.textContent =
    'Load the latest posts to get started.';

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(createButton('Load Feed', 'load'));

  panel.append(title, description, actions);
  feedElement.replaceChildren(panel);
}

/**
 * Renders animated placeholders during LOADING.
 */
function renderLoading() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 3; index += 1) {
    const card = document.createElement('article');
    card.className = 'skeleton-card';
    card.setAttribute('aria-hidden', 'true');

    for (const type of ['title', 'medium', 'short']) {
      const line = document.createElement('div');
      line.className = `skeleton ${type}`;
      card.append(line);
    }

    fragment.append(card);
  }

  feedElement.replaceChildren(fragment);
}

/**
 * Renders validated posts in SUCCESS.
 */
function renderSuccess(posts) {
  const fragment = document.createDocumentFragment();

  for (const post of vietnamesePosts) {
    const card = document.createElement('article');
    card.className = 'feed-card';

    const postId = document.createElement('span');
    postId.className = 'post-id';
    postId.textContent = `POST #${post.id}`;

    const title = document.createElement('h2');
    title.textContent = post.title;

    const body = document.createElement('p');
    body.textContent = post.body;

    card.append(postId, title, body);
    fragment.append(card);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(
    createButton('Refresh Feed', 'load', true)
  );

  fragment.append(actions);
  feedElement.replaceChildren(fragment);
}

/**
 * Renders a readable error and a retry action.
 */
function renderError(message) {
  const panel = document.createElement('div');
  panel.className = 'status-panel error';
  panel.setAttribute('role', 'alert');

  const title = document.createElement('h2');
  title.textContent = 'Unable to load data';

  const description = document.createElement('p');
  description.textContent = message;

  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(
    createButton('Retry Connection', 'load')
  );

  panel.append(title, description, actions);
  feedElement.replaceChildren(panel);
}

/**
 * Maps state machine states to their corresponding UI.
 */
function renderState(state) {
  feedElement.setAttribute(
    'aria-busy',
    String(state.status === STATUS.LOADING)
  );

  switch (state.status) {
    case STATUS.IDLE:
      renderIdle();
      break;

    case STATUS.LOADING:
      renderLoading();
      break;

    case STATUS.SUCCESS:
      renderSuccess(state.data);
      break;

    case STATUS.ERROR:
      renderError(state.error);
      break;

    default:
      throw new Error(`Unsupported state: ${state.status}`);
  }
}

const loader = createDataLoader(renderState);

// Event delegation: one listener handles all action buttons.
feedElement.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button || !feedElement.contains(button)) {
    return;
  }

  if (button.dataset.action === 'load') {
    void loader.load();
  }
});

// Display IDLE before the first request.
renderState(loader.getState());

// Start loading automatically so the skeleton can be observed.
void loader.load();

// Cancel pending requests if the page is being unloaded.
window.addEventListener(
  'pagehide',
  () => loader.dispose(),
  { once: true }
);
