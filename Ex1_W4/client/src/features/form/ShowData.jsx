import { Fragment } from 'react';
import styles from './Form.module.css';

/**
 * Inspector hiển thị dữ liệu đã submit bằng <dl>, thay cho JSON.stringify.
 * @param {{ data: Record<string, unknown>, title?: string }} props
 */
export function ShowData({ data, title = 'Submitted data' }) {
  return (
    <section className={styles.inspector} aria-labelledby="inspector-title">
      <h2 id="inspector-title">{title}</h2>
      <dl className={styles.json}>
        {Object.entries(data).map(([key, val]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{String(val)}</dd>
          </Fragment>
        ))}
      </dl>
    </section>
  );
}