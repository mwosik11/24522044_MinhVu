
import { Fragment, useState } from 'react';
import styles from './DeveloperCard.module.css';
import { SkillBadge } from './SkillBadge';

export function DeveloperCard({
  fullName = 'Tran Le Minh Vu',
  role = 'Senior Systems Architect • UIT S3T',
  avatarUrl = 'https://i.kym-cdn.com/photos/images/original/001/896/259/9f7.jpg',
  metrics = {
    commits: 512,
    vdomNodes: 0,
    a11yScore: 100,
  },
  skills = [
    { id: 'sk-1', name: 'React 19 Fiber', tier: 'Core' },
  ],
}) {
  const [avatarError, setAvatarError] = useState(false);

  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <article
      className={styles.card}
      aria-labelledby="dev-heading"
    >
      <header className={styles.header}>
        {avatarError ? (
          <span className={styles.avatarFallback} aria-hidden="true">
            {initials}
          </span>
        ) : (
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt={fullName}
            width="64"
            height="64"
            onError={() => setAvatarError(true)}
          />
        )}

        <hgroup>
          <h2 id="dev-heading">{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>

      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>

      <ul className={styles.skills} aria-label="Engineered Skills">
        {skills.map((skill) => (
          <li key={skill.id}>
            <SkillBadge
              name={skill.name}
              tier={skill.tier}
            />
          </li>
        ))}
      </ul>
    </article>
  );
}
