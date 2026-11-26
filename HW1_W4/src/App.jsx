import { RouterProvider, createBrowserRouter } from 'react-router';
import { routes } from './routes.jsx';

// Created once at module scope — never inside render.
const router = createBrowserRouter(routes, {
  basename: import.meta.env.BASE_URL,
});

export function App() {
  return <RouterProvider router={router} />;
}