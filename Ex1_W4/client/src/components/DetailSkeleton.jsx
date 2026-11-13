import styles from './DetailSkeleton.module.css';

/** Fallback cùng kích thước với card PersonDetail → CLS = 0 */
export default function DetailSkeleton() {
  return (
    <article className={styles.skeleton} aria-busy="true" aria-live="polite">
      <span className={styles.srOnly}>Đang tải hồ sơ…</span>
      <span className={styles.line} />
      <span className={styles.line} />
      <span className={styles.line} />
    </article>
  );
}