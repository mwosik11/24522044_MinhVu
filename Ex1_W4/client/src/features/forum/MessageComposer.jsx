import { useId, useState } from 'react';
import { validateMessage } from './messageRules.js';
import styles from './Forum.module.css';

const EMPTY = { author: '', text: '' };

/**
 * Form gửi message. Lỗi client tính trong render (giống Sprint 2);
 * lỗi server (400/404/mạng) hiển thị role="alert". Khoá nút khi đang gửi → chống double-submit.
 * @param {{ onPost: (payload: {author: string, text: string}) => Promise<unknown> }} props
 */
export function MessageComposer({ onPost }) {
  const authorId = useId();
  const textId = useId();
  const [values, setValues] = useState(EMPTY);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [serverError, setServerError] = useState(null);

  const errors = validateMessage(values);
  const show = (field) => submitAttempted && errors[field];

  const update = (field) => (e) => setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (Object.keys(errors).length > 0 || isPosting) return;

    setIsPosting(true);
    setServerError(null);
    try {
      await onPost({ author: values.author.trim(), text: values.text.trim() });
      setValues((prev) => ({ ...prev, text: '' }));
      setSubmitAttempted(false);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit} noValidate aria-label="Gửi tin nhắn">
      <p className={styles.field}>
        <label htmlFor={authorId}>Tên hiển thị</label>
        <input
          id={authorId}
          value={values.author}
          onChange={update('author')}
          aria-invalid={Boolean(show('author'))}
          aria-describedby={show('author') ? `${authorId}-error` : undefined}
          autoComplete="nickname"
        />
        {show('author') && <span id={`${authorId}-error`} role="alert" className={styles.error}>{errors.author}</span>}
      </p>
      <p className={styles.field}>
        <label htmlFor={textId}>Nội dung</label>
        <textarea
          id={textId}
          rows={3}
          value={values.text}
          onChange={update('text')}
          aria-invalid={Boolean(show('text'))}
          aria-describedby={show('text') ? `${textId}-error` : undefined}
        />
        {show('text') && <span id={`${textId}-error`} role="alert" className={styles.error}>{errors.text}</span>}
      </p>
      {serverError && <p role="alert" className={styles.error}>Server: {serverError}</p>}
      <p>
        <button type="submit" disabled={isPosting}>{isPosting ? 'Đang gửi…' : 'Gửi'}</button>
      </p>
    </form>
  );
}