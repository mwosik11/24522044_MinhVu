import { CATEGORIES } from '../data/photos.js';

/** Query-string keys. Single place to rename them (live-defense friendly). */
export const PARAM_CATEGORY = 'category';
export const PARAM_PHOTO = 'photoId';
export const DEFAULT_CATEGORY = 'all';

const VALID_SLUGS = new Set(CATEGORIES.map((c) => c.slug));

/**
 * Parse the gallery view state out of the URL. Pure — no React.
 * @param {URLSearchParams} searchParams
 */
export function parseGalleryParams(searchParams) {
  const rawCategory = searchParams.get(PARAM_CATEGORY);
  const isCategoryValid = rawCategory === null || VALID_SLUGS.has(rawCategory);
  const category = rawCategory !== null && isCategoryValid ? rawCategory : DEFAULT_CATEGORY;
  const photoId = searchParams.get(PARAM_PHOTO) || null;
  return { category, rawCategory, isCategoryValid, photoId };
}

/** @returns {Array} a new array; never mutates `photos`. */
export function filterPhotos(photos, category) {
  if (category === DEFAULT_CATEGORY) return [...photos];
  return photos.filter((p) => p.category === category);
}

export function findPhotoById(photos, id) {
  if (!id) return undefined;
  return photos.find((p) => p.id === id);
}

/** Neighbours inside the *filtered* list. No wrap-around: edges return null. */
export function getAdjacentPhotoIds(list, id) {
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return { prevId: null, nextId: null };
  return {
    prevId: list[index - 1]?.id ?? null,
    nextId: list[index + 1]?.id ?? null,
  };
}

// ---- Immutable URLSearchParams builders (preserve unrelated params) ----

export function withCategory(searchParams, category) {
  const next = new URLSearchParams(searchParams);
  if (category === DEFAULT_CATEGORY) next.delete(PARAM_CATEGORY);
  else next.set(PARAM_CATEGORY, category);
  next.delete(PARAM_PHOTO); // a new filter starts with the lightbox closed
  return next;
}

export function withPhoto(searchParams, photoId) {
  const next = new URLSearchParams(searchParams);
  next.set(PARAM_PHOTO, photoId);
  return next;
}

export function withoutPhoto(searchParams) {
  const next = new URLSearchParams(searchParams);
  next.delete(PARAM_PHOTO);
  return next;
}