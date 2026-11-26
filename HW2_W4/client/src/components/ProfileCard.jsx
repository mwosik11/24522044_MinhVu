import { useId } from 'react';

const STAMP = { right: 'LIKE', left: 'NOPE', up: 'FRIENDZONE' };

const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * Presentational card. Drag transform comes from useSwipeGesture via props,
 * so this component has no state of its own.
 */
export function ProfileCard({
  profile,
  offset = { x: 0, y: 0 },
  isDragging = false,
  tentativeDirection = null,
  gestureProps,
}) {
  const titleId = useId();
  const rotation = offset.x / 20;

  return (
    <article
      className={`card${isDragging ? ' card--dragging' : ''}`}
      aria-labelledby={titleId}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)` }}
      data-testid="profile-card"
      {...gestureProps}
    >
      {tentativeDirection && (
        <p className={`card__stamp card__stamp--${tentativeDirection}`} aria-hidden="true">
          {STAMP[tentativeDirection]}
        </p>
      )}

      <p className="card__avatar" aria-hidden="true">
        {initials(profile.name)}
      </p>
      <h2 id={titleId} className="card__name">
        {profile.name}, <span className="card__age">{profile.age}</span>
      </h2>
      <p className="card__city">{profile.city}</p>
      <p className="card__bio">{profile.bio}</p>

      <dl className="card__flags">
        {profile.greenFlags.length > 0 && (
          <>
            <dt>Green flags</dt>
            {profile.greenFlags.map((flag) => (
              <dd key={flag} className="flag flag--green">
                {flag}
              </dd>
            ))}
          </>
        )}
        {profile.redFlags.length > 0 && (
          <>
            <dt>Red flags</dt>
            {profile.redFlags.map((flag) => (
              <dd key={flag} className="flag flag--red">
                {flag}
              </dd>
            ))}
          </>
        )}
      </dl>
    </article>
  );
}