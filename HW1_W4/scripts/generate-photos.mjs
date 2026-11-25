// Generates lightweight, deterministic SVG "evidence photos" into public/photos.
// Run: node scripts/generate-photos.mjs
// Local assets keep the app CDN-free (Lighthouse 100) and the build reproducible.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHOTOS } from '../src/data/photos.js';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'photos');
mkdirSync(outDir, { recursive: true });

/** Small seeded PRNG (mulberry32) so every run produces identical files. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = {
  scene: ['#1e293b', '#334155', '#f59e0b', '#fde68a'],
  forensics: ['#0f172a', '#1e3a5f', '#38bdf8', '#e0f2fe'],
  surveillance: ['#052e16', '#14532d', '#4ade80', '#dcfce7'],
  documents: ['#f5f0e6', '#d6cbb3', '#7c2d12', '#44403c'],
};

const r1 = (n) => Math.round(n);

function scene(rand, [bg, mid, accent, light], w, h) {
  let s = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  for (let i = 0; i < 6; i++) {
    s += `<rect x="${r1(rand() * w * 0.8)}" y="${r1(rand() * h * 0.8)}" width="${r1(80 + rand() * 200)}" height="${r1(60 + rand() * 140)}" fill="${mid}" opacity="0.7"/>`;
  }
  for (let i = 1; i <= 4; i++) {
    const x = r1(60 + rand() * (w - 120));
    const y = r1(60 + rand() * (h - 120));
    s += `<g transform="translate(${x} ${y})"><path d="M-22 18 L0 -22 L22 18 Z" fill="${accent}"/><text y="12" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="700" fill="${bg}">${i}</text></g>`;
  }
  s += `<path d="M40 ${h - 40} H${w - 40}" stroke="${light}" stroke-width="3" stroke-dasharray="12 8"/>`;
  return s;
}

function forensics(rand, [bg, mid, accent, light], w, h) {
  const cx = w / 2 + (rand() - 0.5) * 80;
  const cy = h / 2 + (rand() - 0.5) * 60;
  let s = `<rect width="${w}" height="${h}" fill="${bg}"/><circle cx="${cx}" cy="${cy}" r="${h * 0.42}" fill="${mid}"/>`;
  for (let i = 0; i < 14; i++) {
    const rx = 20 + i * 14;
    const ry = 28 + i * 16;
    const gap = 20 + rand() * 60;
    s += `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${rx}" ry="${ry}" fill="none" stroke="${i % 3 === 0 ? light : accent}" stroke-width="3" stroke-dasharray="${r1(60 + rand() * 120)} ${r1(gap)}" opacity="0.85"/>`;
  }
  s += `<path d="M${w - 170} 40 h130 M${w - 40} 40 v130" stroke="${light}" stroke-width="4" fill="none"/>`;
  return s;
}

function surveillance(rand, [bg, mid, accent, light], w, h) {
  let s = `<rect width="${w}" height="${h}" fill="${bg}"/>`;
  for (let x = 0; x <= w; x += 50) s += `<path d="M${x} 0 V${h}" stroke="${mid}" stroke-width="1"/>`;
  for (let y = 0; y <= h; y += 50) s += `<path d="M0 ${y} H${w}" stroke="${mid}" stroke-width="1"/>`;
  const bx = r1(120 + rand() * (w - 360));
  const by = r1(100 + rand() * (h - 300));
  s += `<rect x="${bx}" y="${by}" width="160" height="200" fill="none" stroke="${accent}" stroke-width="4"/>`;
  s += `<circle cx="${bx + 80}" cy="${by + 60}" r="34" fill="${mid}"/><rect x="${bx + 40}" y="${by + 100}" width="80" height="90" rx="20" fill="${mid}"/>`;
  s += `<circle cx="40" cy="40" r="10" fill="#ef4444"/><text x="60" y="47" font-family="ui-monospace,monospace" font-size="22" fill="${light}">REC</text>`;
  s += `<text x="${w - 30}" y="${h - 28}" text-anchor="end" font-family="ui-monospace,monospace" font-size="22" fill="${light}">CAM-0${1 + Math.floor(rand() * 8)}</text>`;
  return s;
}

function documents(rand, [bg, mid, accent, ink], w, h) {
  let s = `<rect width="${w}" height="${h}" fill="${mid}"/>`;
  s += `<g transform="rotate(${(rand() * 6 - 3).toFixed(1)} ${w / 2} ${h / 2})"><rect x="${w * 0.2}" y="40" width="${w * 0.6}" height="${h - 80}" fill="${bg}"/>`;
  for (let i = 0; i < 14; i++) {
    const y = 90 + i * 30;
    if (y > h - 80) break;
    s += `<path d="M${w * 0.26} ${y} H${r1(w * 0.26 + (w * 0.4) * (0.5 + rand() * 0.5))}" stroke="${ink}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`;
  }
  s += `<circle cx="${w * 0.66}" cy="${h - 120}" r="48" fill="none" stroke="${accent}" stroke-width="6"/><circle cx="${w * 0.66}" cy="${h - 120}" r="34" fill="none" stroke="${accent}" stroke-width="3"/></g>`;
  return s;
}

const DRAW = { scene, forensics, surveillance, documents };

for (const [index, photo] of PHOTOS.entries()) {
  const rand = rng(1000 + index * 97);
  const body = DRAW[photo.category](rand, PALETTES[photo.category], photo.width, photo.height);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${photo.width} ${photo.height}" width="${photo.width}" height="${photo.height}">${body}</svg>\n`;
  writeFileSync(join(outDir, `${photo.id}.svg`), svg);
}

console.log(`Generated ${PHOTOS.length} SVG files in ${outDir}`);