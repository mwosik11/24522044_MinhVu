import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import PeopleLayout from './features/people/PeopleLayout.jsx';
import PeopleIndex from './features/people/PeopleIndex.jsx';
import { SMART_PEOPLE } from './data/people.js';

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'people',
        element: <PeopleLayout people={SMART_PEOPLE} />,
        children: [{ index: true, element: <PeopleIndex /> }],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);