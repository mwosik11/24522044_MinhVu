# AI_FAILURE_AUDIT.md — Lab 4 HW1: Photo & Evidence Gallery

Every entry below is a real defect produced by AI-generated code (or by the AI-written
contract on the lab slides) while building this project. Each one was caught by a test,
by DevTools or by Lighthouse, then fixed and locked in with a regression test.

| # | Area | Severity | Caught by | Regression test |
|---|---|---|---|---|
| 1 | URL state | High | Manual test + Vitest | `close button removes only photoId from the URL` |
| 2 | History | High | Vitest (red) | `browser Back closes the dialog without pushing a new history entry` |
| 3 | Dialog sync | High | DevTools Elements | `browser Back closes the dialog ...` |
| 4 | Performance | Medium | Lighthouse | — (Lighthouse audit) |
| 5 | Layout | Low | DevTools Elements | — (visual) |

---

## 1. `setSearchParams({})` wipes the active filter on close

**AI output** (Lab 4 slide 30, Homework contract):
```jsx
<Lightbox photoId={photoId} onClose={() => setSearchParams({})} />
```

**Symptom / evidence:** open `/gallery?category=forensics&photoId=ev-05` and close the
dialog → URL becomes `/gallery`, the filter jumps back to "All" and any unrelated
params (e.g. `?ref=mail`) are lost.
Screenshot: `docs/evidence/01-filter-wiped.png` (address bar before/after).

**Root cause:** `setSearchParams(object)` *replaces* the whole query string. Closing the
lightbox should only remove `photoId`.

**Fix:** functional update through an immutable builder that preserves everything else:
```js
setSearchParams((prev) => withoutPhoto(prev));
```
Rule added to `project-rules.md` §3.4 — never `setSearchParams({})`.

---

## 2. Closing via browser Back pushes a duplicate history entry

**AI output:**
```jsx
<dialog onClose={() => setSearchParams((prev) => withoutPhoto(prev))}>
```

**Symptom / evidence:** open a photo, press browser Back → the dialog closes, but the
`close` event handler navigates *again*, pushing a new `/gallery?category=scene` entry.
Forward is now broken and Back must be pressed twice to leave the page.
In the Console: `history.length` grows by 1 on every Back.
Screenshot: `docs/evidence/02-history-length.png`.
The Vitest spec failed with `expected 'PUSH' to be 'POP'`.

**Root cause:** the native `close` event fires for *every* close — user-initiated (✕, Esc,
backdrop) **and** programmatic (`dialog.close()` called by our effect after Back already
changed the URL). The handler could not tell them apart.

**Fix:** only sync when the URL still contains a photo:
```js
const closePhoto = () => {
  if (photoId) setSearchParams((prev) => withoutPhoto(prev));
};
```

---

## 3. Dialog opens but never closes when the URL changes

**AI output:**
```jsx
useEffect(() => {
  if (photoId) dialogRef.current.showModal();
}, [photoId]);
```

**Symptom / evidence:** open a photo, press browser Back → the URL no longer has
`photoId`, but an empty `<dialog open>` box stays on screen with the backdrop blocking
the page. DevTools → Elements shows `<dialog class="lightbox" open>` with no children.
Screenshot: `docs/evidence/03-stale-dialog.png`.

**Root cause:** the effect only handled one direction (open). It also had no guard:
calling `showModal()` on an already-open dialog throws `InvalidStateError` in older
browsers and in jsdom, which StrictMode's double effect run exposes.

**Fix:** treat the dialog as an external system synchronised in *both* directions,
idempotently:
```js
useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;
  if (isOpen && !dialog.open) dialog.showModal();
  if (!isOpen && dialog.open) dialog.close();
}, [isOpen]);
```

---

## 4. Every image lazy-loaded, no intrinsic size → LCP and CLS penalties

**AI output:**
```jsx
<img src={photo.src} alt={photo.alt} loading="lazy" />
```

**Symptom / evidence:** Lighthouse (mobile) reported
"Largest Contentful Paint image was lazily loaded" and
"Image elements do not have explicit width and height", with layout shift on load.
Screenshot: `docs/evidence/04-lighthouse-before.png` and `04-lighthouse-after.png`.

**Root cause:** `loading="lazy"` on above-the-fold images delays the LCP element;
without `width`/`height` the browser cannot reserve space before the image arrives.

**Fix:** first row eager, first image `fetchpriority="high"`, every image gets its
intrinsic `width`/`height`, the CSS keeps `aspect-ratio: 4 / 3`. Decorative grid
thumbnails use `alt=""` because the link text already names the photo.

---

## 5. Sticky-footer grid applied to `<body>` instead of the React root

**AI output:**
```css
body { min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto; }
```

**Symptom / evidence:** on short pages (404, Architecture) the footer floats in the
middle of the viewport. DevTools → Elements shows `body` has a single grid child,
`#root`, so header/main/footer are never grid items.
Screenshot: `docs/evidence/05-footer-grid.png` (Layout → Grid overlay).

**Root cause:** React renders everything inside `<div id="root">`; the AI assumed the
landmarks were direct children of `<body>`.

**Fix:** move the grid to `#root`.

---

## Lessons → prompt rules
1. Paste `project-rules.md` + the URL contract table into every prompt.
2. Ask the AI to list **every** event path that can trigger a handler (user vs programmatic).
3. Write the failing test first; never accept generated code that has no test proving it.
4. Verify in DevTools / Lighthouse — "it renders" is not evidence.