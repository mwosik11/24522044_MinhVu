import { RouterProvider, createBrowserRouter } from 'react-router';
import { routes } from './routes.jsx';

// Created once at module scope — never inside render.
const router = createBrowserRouter(routes);

export function App() {
  return <RouterProvider router={router} />;
}