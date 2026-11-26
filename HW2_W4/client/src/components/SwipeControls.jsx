/**
 * Visible buttons for every gesture — pointer swipes alone are not accessible
 * (WCAG 2.5.1 Pointer Gestures / 2.5.7 Dragging Movements).
 * aria-keyshortcuts advertises the keyboard mapping to assistive tech.
 */
export function SwipeControls({ onSwipe, onUndo, canSwipe, canUndo }) {
  return (
    <div className="controls" role="group" aria-label="Swipe actions">
      <button
        type="button"
        className="control control--nope"
        onClick={() => onSwipe('left')}
        disabled={!canSwipe}
        aria-keyshortcuts="ArrowLeft"
      >
        <span aria-hidden="true">←</span> Nope
      </button>
      <button
        type="button"
        className="control control--friend"
        onClick={() => onSwipe('up')}
        disabled={!canSwipe}
        aria-keyshortcuts="ArrowUp"
      >
        <span aria-hidden="true">↑</span> Friendzone
      </button>
      <button
        type="button"
        className="control control--like"
        onClick={() => onSwipe('right')}
        disabled={!canSwipe}
        aria-keyshortcuts="ArrowRight"
      >
        Like <span aria-hidden="true">→</span>
      </button>
      <button
        type="button"
        className="control control--undo"
        onClick={onUndo}
        disabled={!canUndo}
        aria-keyshortcuts="Backspace"
      >
        <span aria-hidden="true">↺</span> Undo
      </button>
    </div>
  );
}