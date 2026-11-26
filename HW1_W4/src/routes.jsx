import { RootLayout } from './components/RootLayout.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { GalleryRoute, AboutRoute } from './pages/lazyPages.jsx';

/**
 * Route objects shared by the browser router (App.jsx) and the memory
 * router used in tests — one source of truth for the route map.
 */
export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'gallery', element: <GalleryRoute /> },
      { path: 'about', element: <AboutRoute /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];