import { useSearchParams } from 'react-router';
import { CATEGORIES, PHOTOS } from '../data/photos.js';
import {
  DEFAULT_CATEGORY,
  filterPhotos,
  parseGalleryParams,
  withCategory,
  withPhoto,
} from '../lib/galleryParams.js';
import { CategoryFilter } from '../components/CategoryFilter.jsx';
import { PhotoGrid } from '../components/PhotoGrid.jsx';

// Static data → compute counts once at module scope, not on every render.
const COUNTS = Object.fromEntries([
  [DEFAULT_CATEGORY, PHOTOS.length],
  ...CATEGORIES.map((c) => [c.slug, PHOTOS.filter((p) => p.category === c.slug).length]),
]);

export function GalleryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Derived during render — the URL is the only state.
  const { category, isCategoryValid, rawCategory } = parseGalleryParams(searchParams);
  const visiblePhotos = filterPhotos(PHOTOS, category);

  const selectCategory = (slug) => setSearchParams((prev) => withCategory(prev, slug));
  const getPhotoHref = (id) => ({ search: `?${withPhoto(searchParams, id)}` });

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

      <PhotoGrid photos={visiblePhotos} getPhotoHref={getPhotoHref} />
    </section>
  );
}