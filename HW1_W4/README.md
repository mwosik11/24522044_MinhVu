# Lab 4 · HW1 — Production Multi-Route Photo & Evidence Gallery SPA

React 19 + React Router v7 single-page app where **every view state lives in the URL**:
the active category filter and the photo opened in the native `<dialog>` lightbox.

## Quick start
```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + Testing Library (35 tests)
npm run build      # production build
npm run preview    # serve the build (use this for Lighthouse)
```
Optional: copy `.env.example` to `.env` to change `VITE_SITE_TITLE` or `VITE_BASE_PATH`.
`node scripts/generate-photos.mjs` regenerates the SVG assets in `public/photos`.

## Requirements → implementation
| Requirement | Where |
|---|---|
| Deep link for category filter (`?category=`) | `src/hooks/useGalleryParams.js`, `src/lib/galleryParams.js` |
| Deep link for the open photo (`?photoId=`) | same + `src/components/Lightbox.jsx` |
| Native `<dialog>` lightbox (focus trap, Esc, backdrop) | `src/components/Lightbox.jsx` |
| Multi-route layout with `<Outlet>` + `NavLink` | `src/routes.jsx`, `src/components/RootLayout.jsx` |
| Route-level code splitting + skeleton | `src/pages/lazyPages.jsx`, `src/components/RouteSkeleton.jsx` |
| WCAG 2.2 AA | skip link, landmarks, `aria-pressed`, `aria-label`, focus return, contrast tokens in `src/styles/global.css` |
| Lighthouse 100 | local SVG assets, explicit image sizes, eager LCP image, no web fonts/CDNs |

## URL contract
```
/gallery?category=<scene|forensics|surveillance|documents>&photoId=<ev-01…ev-12>
```
Try: `/gallery?category=forensics&photoId=ev-05` — opens the dialog directly.
Full history rules: `TASK_DECOMPOSITION.md` §1.2.

## Project structure
```
src/
  components/   RootLayout, RouteSkeleton, CategoryFilter, PhotoGrid, Lightbox
  data/         photos.js (dataset + categories)
  hooks/        useGalleryParams.js (URL ⇄ view state)
  lib/          galleryParams.js (pure functions, unit-tested)
  pages/        HomePage, GalleryPage, AboutPage, NotFoundPage, lazyPages
  styles/       global.css (design tokens, dark mode, reduced motion)
  routes.jsx    route map shared by the app and the tests
```

## Verifying quality
**Lighthouse:** `npm run build && npm run preview` → open the preview URL in Chrome
Incognito → DevTools → Lighthouse → Mobile → Analyze. Target 100 in every category.
(Always audit the production build: the dev server is unminified and scores lower.)

**Keyboard-only walkthrough:** Tab → skip link → nav → filter chips → photo cards →
Enter opens dialog → ←/→ switch photos → Esc closes → focus returns to the card.

**375px:** DevTools device toolbar → width 375 → no horizontal scroll.

## Documentation
- `project-rules.md` — hard constraints for humans and AI assistants
- `TASK_DECOMPOSITION.md` — contracts, WBS and commit map
- `AI_FAILURE_AUDIT.md` — AI defects found, evidence and fixes