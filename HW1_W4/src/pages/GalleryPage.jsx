import { useSearchParams } from 'react-router';
import { CATEGORIES, PHOTOS } from '../data/photos.js';
import {
  DEFAULT_CATEGORY,
  filterPhotos,
  findPhotoById,
  parseGalleryParams,
  withCategory,
  withoutPhoto,
  withPhoto,
} from '../lib/galleryParams.js';
import { CategoryFilter } from '../components/CategoryFilter.jsx';
import { Lightbox } from '../components/Lightbox.jsx';
import { PhotoGrid } from '../components/PhotoGrid.jsx';

// Static data → compute counts once at module scope, not on every render.
const COUNTS = Object.fromEntries([
  [DEFAULT_CATEGORY, PHOTOS.length],
  ...CATEGORIES.map((c) => [c.slug, PHOTOS.filter((p) => p.category === c.slug).length]),
]);

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived during render — the URL is the only state.
  const { category, isCategoryValid, rawCategory, photoId } = parseGalleryParams(searchParams);
  const visiblePhotos = filterPhotos(PHOTOS, category);
  // Look up in ALL photos: a shared link may point outside the active filter.
  const selectedPhoto = findPhotoById(PHOTOS, photoId);

  const selectCategory = (slug) => setSearchParams((prev) => withCategory(prev, slug));
  const getPhotoHref = (id) => ({ search: `?${withPhoto(searchParams, id)}` });

  // Fired on every native `close` event. If photoId is already gone (Back
  // button / filter change closed the dialog programmatically) there is
  // nothing to sync — navigating again would push a duplicate history entry.
  const handleDialogClose = () => {
    if (photoId) setSearchParams((prev) => withoutPhoto(prev));
  };

  return (
    <section className="page" aria-labelledby="gallery-heading">
      <h1 id="gallery-heading">Photo gallery</h1>

      {!isCategoryValid && (
        <p role="status" className="notice">
          Category “{rawCategory}” does not exist — showing all photos.
        </p>
      )}

      <CategoryFilter
        categories={CATEGORIES}
        activeCategory={category}
        counts={COUNTS}
        onSelect={selectCategory}
      />

      <p className="result-count" aria-live="polite">
        Showing {visiblePhotos.length} photos
      </p>

      {photoId && !selectedPhoto && (
        <p role="alert" className="notice notice--error">
          No photo found with id “{photoId}”. The link may be outdated.
        </p>
      )}

      <PhotoGrid photos={visiblePhotos} getPhotoHref={getPhotoHref} />

      <Lightbox photo={selectedPhoto} onClose={handleDialogClose} />
    </section>
  );
}