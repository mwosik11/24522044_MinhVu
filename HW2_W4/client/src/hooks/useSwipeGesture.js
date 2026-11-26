import { useRef, useState } from 'react';
import { getGestureDirection } from '../lib/swipeLogic.js';

const REST = { x: 0, y: 0 };

/**
 * Pointer Events = mouse + touch + pen with one code path.
 * - start position lives in a ref (no re-render, never stale/null on pointerup)
 * - setPointerCapture keeps receiving events when the finger leaves the card
 * - pointercancel (e.g. the browser takes over for scrolling) resets the card
 */
export function useSwipeGesture({ onSwipe, disabled = false }) {
  const startRef = useRef(null);
  const [offset, setOffset] = useState(REST);
  const [isDragging, setIsDragging] = useState(false);

  const reset = () => {
    startRef.current = null;
    setIsDragging(false);
    setOffset(REST);
  };

  const onPointerDown = (event) => {
    if (disabled || event.button !== 0) return; // primary button / first touch only
    startRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event) => {
    const start = startRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    setOffset({ x: event.clientX - start.x, y: event.clientY - start.y });
  };

  const onPointerUp = (event) => {
    const start = startRef.current;
    if (!start || start.pointerId !== event.pointerId) return; // pointerup without pointerdown
    const direction = getGestureDirection(event.clientX - start.x, event.clientY - start.y);
    reset();
    if (direction) onSwipe(direction);
  };

  return {
    offset,
    isDragging,
    tentativeDirection: getGestureDirection(offset.x, offset.y),
    gestureProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: reset },
  };
}