import { CATEGORIES, PHOTOS } from '../data/photos.js';
import { DEFAULT_CATEGORY } from '../lib/galleryParams.js';
import { useGalleryParams } from '../hooks/useGalleryParams.js';
import { CategoryFilter } from '../components/CategoryFilter.jsx';
import { Lightbox } from '../components/Lightbox.jsx';
import { PhotoGrid } from '../components/PhotoGrid.jsx';

// Static data → compute counts once at module scope, not on every render.
const COUNTS = Object.fromEntries([
  [DEFAULT_CATEGORY, PHOTOS.length],
  ...CATEGORIES.map((c) => [c.slug, PHOTOS.filter((p) => p.category === c.slug).length]),
]);

export function GalleryPage() {
  const {
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
  } = useGalleryParams();

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

      <Lightbox
        photo={selectedPhoto}
        prevId={prevId}
        nextId={nextId}
        positionLabel={positionLabel}
        onNavigate={navigateToPhoto}
        onClose={closePhoto}
      />
    </section>
  );
}