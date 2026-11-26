import { useEffect, useEffectEvent } from 'react';

const KEY_TO_DIRECTION = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up' };

function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

/**
 * Global keyboard shortcuts: ← NOPE, → LIKE, ↑ FRIENDZONE, Backspace UNDO.
 * Listening on window (an external system) means the user never has to
 * focus a special div first — unlike `<div tabIndex={0} onKeyDown>`.
 */
export function useKeyboardSwipe({ enabled, onSwipe, onUndo }) {
  // useEffectEvent (React 19.2+): always sees the latest callbacks without re-subscribing.
  const handleKeyDown = useEffectEvent((event) => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (isTypingTarget(event.target)) return; // never steal Backspace from a text field

    const direction = KEY_TO_DIRECTION[event.key];
    if (direction) {
      event.preventDefault(); // stop arrow keys from scrolling the page
      onSwipe(direction);
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      onUndo();
    }
  });

  useEffect(() => {
    if (!enabled) return;
    const listener = (event) => handleKeyDown(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}
