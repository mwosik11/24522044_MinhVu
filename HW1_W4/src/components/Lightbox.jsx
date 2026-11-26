import { useEffect, useId, useRef } from 'react';
import { CATEGORIES } from '../data/photos.js';

const BASE = import.meta.env.BASE_URL;
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label]));
const dateFormat = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Native <dialog> lightbox. The `photo` prop (derived from ?photoId) is the
 * only input that decides open/closed; this component merely synchronises the
 * imperative dialog API with it.
 *
 * @param {{ photo?: object, onClose: () => void }} props
 *   onClose — fired for EVERY native `close` event (button, Esc, programmatic).
 *   The parent decides whether the URL still needs updating.
 */
export function Lightbox({ photo, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const isOpen = Boolean(photo);

  // Sync an external system (the DOM dialog) with derived state.
  // Guards make it idempotent under StrictMode's double effect invocation:
  // showModal() on an already-open dialog throws InvalidStateError.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const requestClose = () => dialogRef.current?.close();

  // Light dismiss: a click whose target is the <dialog> itself hit the backdrop.
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) requestClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={handleBackdropClick}
    >
      {photo && (
        <article className="lightbox__body">
          <header className="lightbox__header">
            <h2 id={titleId}>{photo.title}</h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Close photo"
              onClick={requestClose}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </header>

          <figure className="lightbox__figure">
            <img
              src={`${BASE}${photo.src}`}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              decoding="async"
            />
            <figcaption>{photo.description}</figcaption>
          </figure>

          <dl className="kv-list kv-list--compact">
            <dt>Case ref</dt>
            <dd>{photo.caseRef}</dd>
            <dt>Category</dt>
            <dd>{CATEGORY_LABEL[photo.category]}</dd>
            <dt>Captured</dt>
            <dd>
              <time dateTime={photo.capturedAt}>{dateFormat.format(new Date(photo.capturedAt))}</time>
            </dd>
            <dt>Location</dt>
            <dd>{photo.location}</dd>
          </dl>
        </article>
      )}
    </dialog>
  );
}