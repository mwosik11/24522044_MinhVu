import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { useGalleryParams } from './useGalleryParams.js';

function setup(url) {
  const wrapper = ({ children }) => <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>;
  return renderHook(() => ({ gallery: useGalleryParams(), location: useLocation() }), { wrapper });
}

describe('useGalleryParams', () => {
  it('derives selection, neighbours and position from the URL', () => {
    const { result } = setup('/gallery?category=surveillance&photoId=ev-08');
    const { gallery } = result.current;
    expect(gallery.selectedPhoto.id).toBe('ev-08');
    expect(gallery.prevId).toBe('ev-07');
    expect(gallery.nextId).toBe('ev-09');
    expect(gallery.positionLabel).toBe('2 / 3');
  });

  it('closePhoto is a no-op when no photo is open (no duplicate history entry)', () => {
    const { result } = setup('/gallery?category=scene');
    const keyBefore = result.current.location.key;
    act(() => result.current.gallery.closePhoto());
    expect(result.current.location.key).toBe(keyBefore);
  });

  it('selectCategory("all") removes both category and photoId', () => {
    const { result } = setup('/gallery?category=scene&photoId=ev-01');
    act(() => result.current.gallery.selectCategory('all'));
    expect(result.current.location.search).toBe('');
  });
});