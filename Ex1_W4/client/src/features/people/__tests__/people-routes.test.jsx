import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../../../router.jsx';

const renderAt = (url) => {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(<RouterProvider router={router} />);
  return router;
};

describe('Sprint 1 — People master-detail routes', () => {
  it('renders sidebar links for every person', () => {
    renderAt('/people');
    const nav = screen.getByRole('navigation', { name: 'People' });
    expect(nav.querySelectorAll('a')).toHaveLength(6);
  });

  it('shows person detail in a <dl> from the :id param', async () => {
    renderAt('/people/sp-2');
    expect(await screen.findByRole('heading', { name: 'Albert Einstein' })).toBeInTheDocument();
    expect(screen.getByText('Theoretical Physicist').tagName).toBe('DD');
  });

  it('marks the active NavLink with aria-current="page"', async () => {
    renderAt('/people/sp-2');
    await screen.findByRole('heading', { name: 'Albert Einstein' });
    expect(screen.getByRole('link', { name: 'Albert Einstein' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders a 404 alert for an unknown id', async () => {
    renderAt('/people/khong-ton-tai');
    expect(await screen.findByRole('alert')).toHaveTextContent('404: Person Not Found');
  });

  it('navigates between people without a full reload', async () => {
    const router = renderAt('/people/sp-1');
    await screen.findByRole('heading', { name: 'Johann Goethe' });
    await userEvent.click(screen.getByRole('link', { name: 'Isaac Newton' }));
    expect(await screen.findByRole('heading', { name: 'Isaac Newton' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/people/sp-4');
  });

  it('renders a 404 page for unknown routes', () => {
    renderAt('/khong-co-trang-nay');
    expect(screen.getByRole('heading', { name: /404/ })).toBeInTheDocument();
  });
});