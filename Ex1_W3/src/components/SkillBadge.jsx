
import styles from './DeveloperCard.module.css';

export function SkillBadge({ name, tier }) {
  return (
    <span className={styles.skillBadge}>
      <strong>{name}</strong>
      <small>{tier}</small>
    </span>
  );
}
