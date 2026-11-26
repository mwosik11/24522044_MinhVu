import { DeckProvider } from './context/DeckContext.jsx';
import { RootLayout } from './components/RootLayout.jsx';
import { DeckPage } from './pages/DeckPage.jsx';
import { MatchesPage } from './pages/MatchesPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

/** Shared by the browser router (App.jsx) and the memory router in tests. */
export const routes = [
  {
    path: '/',
    element: (
      <DeckProvider>
        <RootLayout />
      </DeckProvider>
    ),
    children: [
      { index: true, element: <DeckPage /> },
      { path: 'matches', element: <MatchesPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];