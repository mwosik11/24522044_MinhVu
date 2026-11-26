import { useSearchParams } from 'react-router';
import { PHOTOS } from '../data/photos.js';
import {
  filterPhotos,
  findPhotoById,
  getAdjacentPhotoIds,
  parseGalleryParams,
  withCategory,
  withoutPhoto,
  withPhoto,
} from '../lib/galleryParams.js';

/**
 * All gallery view state, derived from the URL — and the only actions
 * allowed to change it. No useState, no useEffect: the query string is
 * the single source of truth (project-rules.md §3).
 *
 * @param {ReadonlyArray<object>} photos dataset (injectable for tests)
 */
export function useGalleryParams(photos = PHOTOS) {
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- Derived during render ----
  const { category, isCategoryValid, rawCategory, photoId } = parseGalleryParams(searchParams);
  const visiblePhotos = filterPhotos(photos, category);
  // Look up in ALL photos: a shared link may point outside the active filter.
  const selectedPhoto = findPhotoById(photos, photoId);
  const { prevId, nextId } = getAdjacentPhotoIds(visiblePhotos, photoId);
  const position = visiblePhotos.findIndex((p) => p.id === photoId);
  const positionLabel = position === -1 ? undefined : `${position + 1} / ${visiblePhotos.length}`;

  // ---- Actions (history semantics documented in TASK_DECOMPOSITION.md §1.2) ----

  /** PUSH — Back returns to the previous filter. Always closes the lightbox. */
  const selectCategory = (slug) => setSearchParams((prev) => withCategory(prev, slug));

  /** Href for a <Link> that opens a photo (PUSH) while keeping other params. */
  const getPhotoHref = (id) => ({ search: `?${withPhoto(searchParams, id)}` });

  /** REPLACE — browsing with ←/→ must not flood the history stack. */
  const navigateToPhoto = (id) =>
    setSearchParams((prev) => withPhoto(prev, id), { replace: true });

  /**
   * PUSH — called on every native `close` event. If photoId is already gone
   * (Back button closed the dialog programmatically) there is nothing to sync;
   * navigating again would push a duplicate history entry.
   */
  const closePhoto = () => {
    if (photoId) setSearchParams((prev) => withoutPhoto(prev));
  };

  return {
    category,
    isCategoryValid,
    rawCategory,
    photoId,
    visiblePhotos,
    selectedPhoto,
    prevId,
    nextId,
    positionLabel,
    selectCategory,
    getPhotoHref,
    navigateToPhoto,
    closePhoto,
  };
}