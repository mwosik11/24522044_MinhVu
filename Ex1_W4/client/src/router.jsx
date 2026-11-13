import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import PeopleLayout from './features/people/PeopleLayout.jsx';
import PeopleIndex from './features/people/PeopleIndex.jsx';
import PersonDetail from './features/people/PersonDetail.jsx';
import { SMART_PEOPLE } from './data/people.js';

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [                                   // ← children của "/"
      { index: true, element: <Home /> },
      {
        path: 'people',
        element: <PeopleLayout people={SMART_PEOPLE} />,
        children: [                               // ← children của "people": :id nằm ở ĐÂY
          { index: true, element: <PeopleIndex /> },
          { path: ':id', element: <PersonDetail people={SMART_PEOPLE} /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);