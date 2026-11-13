import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Missing #root mount container');

createRoot(rootEl).render(
  <StrictMode>
    <main><h1>Lab 4 — scaffold OK</h1></main>
  </StrictMode>
);