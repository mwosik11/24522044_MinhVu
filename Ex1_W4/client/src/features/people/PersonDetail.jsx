import { Link, useParams } from 'react-router';
import styles from './People.module.css';

/**
 * Detail pane: đọc :id từ URL, tìm người, 404 nếu không có.
 * @param {{ people: ReadonlyArray<import('../../data/people.js').Person> }} props
 */
export default function PersonDetail({ people = [] }) {
  const { id } = useParams();
  const person = people.find((p) => p.id === id);

  if (!person) {
    return (
      <article role="alert" className={styles.card}>
        <h2>404: Person Not Found</h2>
        <p>Không có hồ sơ với ID “{id}”. <Link to="/people">Quay lại danh sách</Link></p>
      </article>
    );
  }

  return (
    <article className={styles.card} aria-labelledby="person-name">
      <h2 id="person-name">{person.name}</h2>
      <dl className={styles.details}>
        <dt>Name</dt><dd>{person.name}</dd>
        <dt>Role</dt><dd>{person.role}</dd>
        <dt>Age</dt><dd>{person.age}</dd>
        <dt>IQ</dt><dd>{person.iq}</dd>
      </dl>
    </article>
  );
}