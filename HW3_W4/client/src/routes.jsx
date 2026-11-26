import { TribunalLayout } from './components/TribunalLayout.jsx';
import { OverviewPage } from './pages/OverviewPage.jsx';
import { DossierPage } from './pages/DossierPage.jsx';
import { AppealPage } from './pages/AppealPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

/**
 * ONE dynamic dossier route for every player (the slide contract hard-coded
 * /dossier/himass and /dossier/tanvuu — see AI_FAILURE_AUDIT.md).
 */
export const routes = [
  {
    path: '/',
    element: <TribunalLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      {
        path: 'dossier/:playerID',
        element: <DossierPage />,
        children: [{ path: 'appeal', element: <AppealPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];