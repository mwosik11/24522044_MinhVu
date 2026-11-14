import { Fragment } from 'react';
import styles from './Forum.module.css';

const timeFormat = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

/** @param {{ messages: import('./useForumMessages.js').Message[] }} props */
export function MessageList({ messages }) {
  if (messages.length === 0) {
    return <p className={styles.empty}>Chưa có tin nhắn nào trong kênh này.</p>;
  }
  return (
    <dl className={styles.messages}>
      {messages.map((msg) => (
        <Fragment key={msg.id}>
          <dt>
            <strong>{msg.author}</strong>{' '}
            <time dateTime={msg.timestamp}>{timeFormat.format(new Date(msg.timestamp))}</time>
          </dt>
          <dd>{msg.text}</dd>
        </Fragment>
      ))}
    </dl>
  );
}