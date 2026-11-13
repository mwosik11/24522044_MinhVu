import { NavLink, Outlet } from 'react-router';
import styles from './People.module.css';

/**
 * Master pane: danh sách người + vùng detail render qua <Outlet />.
 * @param {{ people: ReadonlyArray<import('../../data/people.js').Person> }} props
 */
export default function PeopleLayout({ people = [] }) {
  return (
    <section className={styles.frame} aria-labelledby="people-title">
      <h1 id="people-title" className={styles.title}>People Directory</h1>
      <nav className={styles.sidebar} aria-label="People">
        <ul>
          {people.map((p) => (
            <li key={p.id}>
              <NavLink
                to={`/people/${p.id}`}
                className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
              >
                {p.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <section className={styles.content} aria-label="Person detail">
        <Outlet />
      </section>
    </section>
  );
}