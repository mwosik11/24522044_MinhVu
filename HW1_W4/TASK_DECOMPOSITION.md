# TASK_DECOMPOSITION.md — Lab 4 HW1: Production Multi-Route Photo & Evidence Gallery SPA

## 0. Assignment (Lab 4, slides 19 & 30)

1. **Deep linking** with `useSearchParams()` for category filters and for the photo opened in the modal.
2. **Lightbox** built on the native HTML `<dialog>` element.
3. **Quality**: WCAG 2.2 AA compliance and a 100/100 Lighthouse Performance score.

## 1. Contract

### 1.1 Route map

| Path       | Element                           | Notes                                                     |
| ---------- | --------------------------------- | --------------------------------------------------------- |
| `/`        | `RootLayout` → `HomePage` (index) | Layout: skip link, header + `NavLink`, `<Outlet>`, footer |
| `/gallery` | `GalleryPage` (lazy)              | Reads/writes the query string                             |
| `/about`   | `AboutPage` (lazy)                | Architecture notes                                        |
| `*`        | `NotFoundPage`                    | 404 with `role="alert"`                                   |

### 1.2 URL contract for `/gallery`

```
/gallery?category=<slug>&photoId=<id>
```

| Param      | Valid values                                      | Missing                   | Invalid                                   |
| ---------- | ------------------------------------------------- | ------------------------- | ----------------------------------------- |
| `category` | `scene`, `forensics`, `surveillance`, `documents` | = `all` (show everything) | Treated as `all` + `role="status"` notice |
| `photoId`  | an id that exists in the dataset                  | dialog closed             | dialog closed + `role="alert"` notice     |

History rules:
| Action | URL write | Reason |
|---|---|---|
| Change category | push, **drop `photoId`** | Back returns to the previous filter |
| Open photo | push | Back closes the photo |
| Previous/next photo | **replace** | Browsing must not flood the history stack |
| Close photo (✕ button, Esc, backdrop click) | push, keep `category` | URL always mirrors the view |
| Back while dialog is open | URL changes → effect calls `dialog.close()` | Must NOT push an extra entry |

### 1.3 Data contract

```js
/** @typedef {'scene'|'forensics'|'surveillance'|'documents'} CategorySlug */
/**
 * @typedef {Object} EvidencePhoto
 * @property {string} id          // 'ev-01' — stable key, used in URL
 * @property {string} caseRef     // 'CASE-2026-014'
 * @property {string} title
 * @property {CategorySlug} category
 * @property {string} capturedAt  // ISO 8601
 * @property {string} location
 * @property {string} description
 * @property {string} alt
 * @property {string} src         // 'photos/ev-01.svg' (relative to BASE_URL)
 * @property {number} width
 * @property {number} height
 */
```

### 1.4 Pure functions (`src/lib/galleryParams.js`)

| Function                                 | Input → Output                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| `parseGalleryParams(searchParams)`       | → `{ category, isCategoryValid, rawCategory, photoId }`                 |
| `filterPhotos(photos, category)`         | → new array (never mutates)                                             |
| `findPhotoById(photos, id)`              | → photo \| `undefined`                                                  |
| `getAdjacentPhotoIds(list, id)`          | → `{ prevId, nextId }` (null at both edges, no wrap-around)             |
| `withCategory(sp, category)`             | → new `URLSearchParams`, drops `photoId`, removes `category` when `all` |
| `withPhoto(sp, id)` / `withoutPhoto(sp)` | → new `URLSearchParams`, keeps unrelated params                         |

### 1.5 Component contract

| Component        | Props                                                       | Responsibility                                                |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| `RootLayout`     | —                                                           | Landmarks, active `NavLink`, `<Suspense>` around `<Outlet>`   |
| `RouteSkeleton`  | `label`                                                     | Dimension-matched fallback, `aria-busy`, `aria-live="polite"` |
| `CategoryFilter` | `categories, activeCategory, counts, onSelect`              | Toggle-button group with `aria-pressed`                       |
| `PhotoGrid`      | `photos, getPhotoHref`                                      | `<ul>` grid; every photo is a `<Link>` (shareable deep link)  |
| `Lightbox`       | `photo, prevId, nextId, positionLabel, onNavigate, onClose` | `<dialog>`; keeps `showModal`/`close` in sync with `photo`    |

## 2. WBS → Commit map

| Task | Description                                               | Commit                    |
| ---- | --------------------------------------------------------- | ------------------------- |
| T-00 | Scaffold Vite / React 19 / Router v7 / Vitest             | `chore: scaffold ...`     |
| T-01 | Write contract + rules (this file)                        | `docs(contract): ...`     |
| T-02 | Dataset + SVG generator script                            | `feat(data): ...`         |
| T-03 | Failing tests for pure functions                          | `test(gallery): ...`      |
| T-04 | Implement pure functions                                  | `feat(gallery): ...`      |
| T-05 | Router v7 layout, lazy routes, skeleton, 404              | `feat(router): ...`       |
| T-06 | Failing tests for deep links + dialog                     | `test(gallery-page): ...` |
| T-07 | Gallery page + filter via `useSearchParams`               | `feat(gallery-page): ...` |
| T-08 | `<dialog>` lightbox driven by `photoId`                   | `feat(lightbox): ...`     |
| T-09 | ←/→ keys, prev/next buttons, focus return                 | `feat(lightbox): ...`     |
| T-10 | Design tokens, responsive grid, dark mode, reduced motion | `style: ...`              |
| T-11 | Refactor: extract `useGalleryParams` hook                 | `refactor(gallery): ...`  |
| T-12 | AI_FAILURE_AUDIT.md + README                              | `docs: ...`               |

## 3. Definition of Done

- [ ] `npm test` green, `npm run build` with no warnings.
- [ ] Opening `/gallery?category=forensics&photoId=ev-05` directly shows the right photo in the dialog with the right filter.
- [ ] Back/Forward close/open the dialog correctly without extra history entries.
- [ ] Chrome DevTools Console: 0 warnings/errors. Lighthouse (`npm run build` + `npm run preview`): Performance/Accessibility/Best Practices/SEO = 100.
- [ ] No horizontal scroll at 375px. Everything reachable by keyboard.
