import { lazy } from 'react';

// Route-level code splitting: each page becomes its own chunk.
// The Suspense boundary lives in RootLayout so the header never unmounts.
export const GalleryRoute = lazy(() =>
  import('./GalleryPage.jsx').then((m) => ({ default: m.GalleryPage })),
);
export const AboutRoute = lazy(() =>
  import('./AboutPage.jsx').then((m) => ({ default: m.AboutPage })),
);