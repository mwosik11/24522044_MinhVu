import { describe, expect, it } from 'vitest';
import { PHOTOS } from '../data/photos.js';
import {
  DEFAULT_CATEGORY,
  filterPhotos,
  findPhotoById,
  getAdjacentPhotoIds,
  parseGalleryParams,
  withCategory,
  withoutPhoto,
  withPhoto,
} from './galleryParams.js';

const sp = (query) => new URLSearchParams(query);

describe('parseGalleryParams', () => {
  it('defaults to all categories and no photo', () => {
    expect(parseGalleryParams(sp(''))).toEqual({
      category: DEFAULT_CATEGORY,
      rawCategory: null,
      isCategoryValid: true,
      photoId: null,
    });
  });

  it('reads a valid category and photoId', () => {
    const result = parseGalleryParams(sp('category=forensics&photoId=ev-05'));
    expect(result.category).toBe('forensics');
    expect(result.isCategoryValid).toBe(true);
    expect(result.photoId).toBe('ev-05');
  });

  it('falls back to "all" and flags an unknown category', () => {
    const result = parseGalleryParams(sp('category=<script>'));
    expect(result.category).toBe('all');
    expect(result.isCategoryValid).toBe(false);
    expect(result.rawCategory).toBe('<script>');
  });

  it('treats an empty photoId as no photo', () => {
    expect(parseGalleryParams(sp('photoId=')).photoId).toBeNull();
  });
});

describe('filterPhotos', () => {
  it('returns every photo for "all" without mutating the input', () => {
    const result = filterPhotos(PHOTOS, 'all');
    expect(result).toHaveLength(PHOTOS.length);
    expect(result).not.toBe(PHOTOS);
  });

  it('returns only photos of the requested category', () => {
    const result = filterPhotos(PHOTOS, 'documents');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === 'documents')).toBe(true);
  });
});

describe('findPhotoById', () => {
  it('finds an existing photo', () => {
    expect(findPhotoById(PHOTOS, 'ev-07')?.title).toBe('Lobby camera at 02:14');
  });

  it('returns undefined for unknown or null ids', () => {
    expect(findPhotoById(PHOTOS, 'ev-999')).toBeUndefined();
    expect(findPhotoById(PHOTOS, null)).toBeUndefined();
  });
});

describe('getAdjacentPhotoIds', () => {
  const list = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('returns prev and next ids in the middle', () => {
    expect(getAdjacentPhotoIds(list, 'b')).toEqual({ prevId: 'a', nextId: 'c' });
  });

  it('does not wrap around at the edges', () => {
    expect(getAdjacentPhotoIds(list, 'a')).toEqual({ prevId: null, nextId: 'b' });
    expect(getAdjacentPhotoIds(list, 'c')).toEqual({ prevId: 'b', nextId: null });
  });

  it('returns nulls when the photo is not in the filtered list', () => {
    expect(getAdjacentPhotoIds(list, 'z')).toEqual({ prevId: null, nextId: null });
  });
});

describe('search param builders (immutable, preserve unrelated params)', () => {
  it('withCategory sets category, drops photoId, keeps other params', () => {
    const before = sp('utm=mail&photoId=ev-01');
    const after = withCategory(before, 'scene');
    expect(after.get('category')).toBe('scene');
    expect(after.has('photoId')).toBe(false);
    expect(after.get('utm')).toBe('mail');
    expect(before.get('photoId')).toBe('ev-01'); // input untouched
  });

  it('withCategory removes the param entirely for "all"', () => {
    expect(withCategory(sp('category=scene'), 'all').has('category')).toBe(false);
  });

  it('withPhoto sets photoId and keeps category', () => {
    const after = withPhoto(sp('category=scene'), 'ev-02');
    expect(after.toString()).toBe('category=scene&photoId=ev-02');
  });

  it('withoutPhoto removes only photoId', () => {
    const after = withoutPhoto(sp('category=scene&photoId=ev-02'));
    expect(after.toString()).toBe('category=scene');
  });
});