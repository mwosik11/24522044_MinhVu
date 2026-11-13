import { Link } from 'react-router';

export default function Home() {
  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title">Lab 4 — Multi-Route SPA</h1>
      <p>Mở <Link to="/people">People Directory</Link> để xem master-detail.</p>
    </section>
  );
}