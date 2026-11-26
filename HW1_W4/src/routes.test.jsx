import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { routes } from './routes.jsx';

const renderAt = (url) =>
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: [url] })} />);

describe('route map', () => {
  it('renders the home page with an active NavLink', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Photo & Evidence Gallery');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('lazy-loads the gallery route behind a Suspense skeleton', async () => {
    renderAt('/gallery');
    expect(await screen.findByRole('heading', { level: 1, name: 'Photo gallery' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gallery' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders a 404 alert for unknown paths', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByRole('alert')).toHaveTextContent('/does-not-exist');
  });

  it('exposes a skip link as the first focusable element', () => {
    renderAt('/');
    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '#main-content');
  });
});