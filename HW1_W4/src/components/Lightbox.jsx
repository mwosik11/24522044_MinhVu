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
 * @param {{
 *   photo?: object,
 *   prevId: string|null,
 *   nextId: string|null,
 *   positionLabel?: string,
 *   onNavigate: (id: string) => void,
 *   onClose: () => void,
 * }} props
 *   onClose — fired for EVERY native `close` event (button, Esc, programmatic).
 *   The parent decides whether the URL still needs updating.
 */
export function Lightbox({ photo, prevId, nextId, positionLabel, onNavigate, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const isOpen = Boolean(photo);
  // Remember which photo was shown so focus can return to its card on close,
  // even after ←/→ moved away from the card that originally opened the dialog.
  const lastPhotoIdRef = useRef(null);
  if (photo) lastPhotoIdRef.current = photo.id;

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

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight' && nextId) {
      event.preventDefault();
      onNavigate(nextId);
    } else if (event.key === 'ArrowLeft' && prevId) {
      event.preventDefault();
      onNavigate(prevId);
    }
  };

  const handleClose = () => {
    onClose();
    // WCAG 2.4.3 Focus Order: return focus to the card of the photo just viewed.
    // The id comes from our own dataset, so it is safe inside a selector.
    const id = lastPhotoIdRef.current;
    if (id) document.querySelector(`[data-photo-id="${id}"]`)?.focus();
  };

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-labelledby={titleId}
      onClose={handleClose}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
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

          <nav className="lightbox__nav" aria-label="Photo navigation">
            <button
              type="button"
              className="button"
              aria-label="Previous photo"
              disabled={!prevId}
              onClick={() => onNavigate(prevId)}
            >
              <span aria-hidden="true">←</span> Previous
            </button>
            {positionLabel && <p className="lightbox__position">{positionLabel}</p>}
            <button
              type="button"
              className="button"
              aria-label="Next photo"
              disabled={!nextId}
              onClick={() => onNavigate(nextId)}
            >
              Next <span aria-hidden="true">→</span>
            </button>
          </nav>
          <p className="lightbox__hint">Tip: use the ← → keys to switch photos and Esc to close.</p>
        </article>
      )}
    </dialog>
  );
}