import { Link } from 'react-router';

const BASE = import.meta.env.BASE_URL;
const EAGER_COUNT = 3; // first row is above the fold on most screens

/**
 * Each card is a real <Link>: middle-click / copy-link / share all work,
 * and opening the lightbox is just a URL change.
 */
export function PhotoGrid({ photos, getPhotoHref }) {
  if (photos.length === 0) {
    return <p className="empty">No photos in this category.</p>;
  }

  return (
    <ul className="photo-grid" aria-label="Photos">
      {photos.map((photo, index) => (
        <li key={photo.id}>
          <Link className="photo-card" to={getPhotoHref(photo.id)} data-photo-id={photo.id}>
            <img
              src={`${BASE}${photo.src}`}
              alt="" // decorative here: the link text below names the photo
              width={photo.width}
              height={photo.height}
              loading={index < EAGER_COUNT ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
              decoding="async"
            />
            <span className="photo-card__title">{photo.title}</span>
            <span className="photo-card__meta">{photo.caseRef}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}