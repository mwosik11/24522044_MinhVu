import { NavLink, Outlet } from 'react-router';
import styles from './RootLayout.module.css';

const navClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link);

export default function RootLayout() {
  return (
    <>
      <a href="#main-content" className="skip-link">Bỏ qua tới nội dung chính</a>
      <header className={styles.header}>
        <p className={styles.brand}>UIT S3T · Lab 4</p>
        <nav aria-label="Primary">
          <ul className={styles.navList}>
            <li><NavLink to="/" end className={navClass}>Home</NavLink></li>
            <li><NavLink to="/people" className={navClass}>People</NavLink></li>
            <li><NavLink to="/form" className={navClass}>Form</NavLink></li>
            <li><NavLink to="/forum" className={navClass}>Forum</NavLink></li>
          </ul>
        </nav>
      </header>
      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}