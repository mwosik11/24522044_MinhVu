import { DEFAULT_CATEGORY } from '../lib/galleryParams.js';

/**
 * Toggle-button group. Buttons (not links) because filtering changes the
 * current view; the resulting URL is still shareable.
 */
export function CategoryFilter({ categories, activeCategory, counts, onSelect }) {
  const options = [{ slug: DEFAULT_CATEGORY, label: 'All' }, ...categories];

  return (
    <section className="filter" aria-labelledby="filter-heading">
      <h2 id="filter-heading" className="visually-hidden">
        Filter by category
      </h2>
      <ul className="filter__list">
        {options.map((option) => {
          const isActive = option.slug === activeCategory;
          return (
            <li key={option.slug}>
              <button
                type="button"
                className="chip"
                aria-pressed={isActive}
                onClick={() => onSelect(option.slug)}
              >
                {option.label} <span className="chip__count">({counts[option.slug] ?? 0})</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}