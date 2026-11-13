import { Link } from 'react-router';

export default function NotFound() {
  return (
    <section role="alert" aria-labelledby="nf-title">
      <h1 id="nf-title">404 — Không tìm thấy trang</h1>
      <p><Link to="/">Về trang chủ</Link></p>
    </section>
  );
}