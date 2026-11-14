import { NavLink, useParams } from 'react-router';
import { useForumMessages } from './useForumMessages.js';
import { MessageList } from './MessageList.jsx';
import { MessageComposer } from './MessageComposer.jsx';
import styles from './Forum.module.css';

/** 'notNasa' cố ý không có trên server → kiểm chứng nhánh ERROR + Retry */
export const CHANNELS = Object.freeze(['nasa', 'esports-tribunal', 'notNasa']);

export default function ForumPage() {
  const { forumId } = useParams();
  const { status, data, error, retry, postMessage } = useForumMessages(forumId);

  return (
    <section className={styles.page} aria-labelledby="forum-title">
      <h1 id="forum-title">Forum Channels</h1>

      <nav aria-label="Channels">
        <ul className={styles.channels}>
          {CHANNELS.map((id) => (
            <li key={id}>
              <NavLink to={`/forum/${id}`} className={({ isActive }) => (isActive ? `${styles.channel} ${styles.active}` : styles.channel)}>
                #{id}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <section className={styles.feed} aria-labelledby="feed-title" aria-busy={status === 'LOADING'}>
        <h2 id="feed-title">#{forumId}</h2>

        {status === 'LOADING' && data.length === 0 && (
          <p className={styles.skeleton} aria-live="polite">
            <span className={styles.srOnly}>Đang tải tin nhắn…</span>
          </p>
        )}

        {status === 'ERROR' && (
          <section role="alert" className={styles.alert}>
            <p>Không tải được kênh: {error}</p>
            <button type="button" onClick={retry}>Thử lại</button>
          </section>
        )}

        {status !== 'ERROR' && data.length > 0 && <MessageList messages={data} />}
        {status === 'SUCCESS' && data.length === 0 && <MessageList messages={[]} />}
      </section>

      {status !== 'ERROR' && <MessageComposer key={forumId} onPost={postMessage} />}
    </section>
  );
}