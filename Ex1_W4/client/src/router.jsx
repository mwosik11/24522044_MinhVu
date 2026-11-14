import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import PeopleLayout from './features/people/PeopleLayout.jsx';
import PeopleIndex from './features/people/PeopleIndex.jsx';
import DetailSkeleton from './components/DetailSkeleton.jsx';
import { SMART_PEOPLE } from './data/people.js';
import SimpleForm from './features/form/SimpleForm.jsx';

// Ex 1.1: route-level code-splitting → PersonDetail nằm ở chunk riêng
const PersonDetail = lazy(() => import('./features/people/PersonDetail.jsx'));

/** Export riêng mảng routes để test dùng lại với createMemoryRouter */
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
        children: [
          { index: true, element: <PeopleIndex /> },
          {
            path: ':id',
            element: (
              <Suspense fallback={<DetailSkeleton />}>
                <PersonDetail people={SMART_PEOPLE} />
              </Suspense>
            ),
          },
        ],
      },
      { path: 'form', element: <SimpleForm /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);