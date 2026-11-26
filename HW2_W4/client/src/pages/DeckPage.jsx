import { Link } from 'react-router';
import { useDeck } from '../context/DeckContext.jsx';
import { useKeyboardSwipe } from '../hooks/useKeyboardSwipe.js';
import { useSwipeGesture } from '../hooks/useSwipeGesture.js';
import { ProfileCard } from '../components/ProfileCard.jsx';
import { ScoreBoard } from '../components/ScoreBoard.jsx';
import { SwipeControls } from '../components/SwipeControls.jsx';

export function DeckPage() {
  const { profilesState, status, error, current, remaining, score, stats, canUndo, swipe, undo } = useDeck();
  const isReady = profilesState.status === 'success' && status === 'ready';

  const { offset, isDragging, tentativeDirection, gestureProps } = useSwipeGesture({
    onSwipe: swipe,
    disabled: !isReady || !current,
  });
  useKeyboardSwipe({ enabled: isReady, onSwipe: swipe, onUndo: undo });

  return (
    <section className="deck-page" aria-labelledby="deck-heading">
      <h1 id="deck-heading">Swipe deck</h1>
      <ScoreBoard score={score} stats={stats} remainingCount={remaining.length} />

      {error && (
        <p role="alert" className="notice notice--error">
          {error}
        </p>
      )}

      <div className="deck">
        {profilesState.status === 'error' ? (
          <div role="alert" className="deck__message">
            <p>Could not load profiles: {profilesState.error}</p>
            <button type="button" className="button" onClick={profilesState.retry}>
              Retry
            </button>
          </div>
        ) : !isReady ? (
          <p className="card card--skeleton" aria-busy="true">
            Loading profiles…
          </p>
        ) : current ? (
          <ProfileCard
            key={current.slug}
            profile={current}
            offset={offset}
            isDragging={isDragging}
            tentativeDirection={tentativeDirection}
            gestureProps={gestureProps}
          />
        ) : (
          <div className="deck__message">
            <h2>You&apos;ve seen everyone</h2>
            <p>Final score: {score}.</p>
            <p>
              <Link to="/matches">See your matches</Link>
            </p>
          </div>
        )}
      </div>

      <SwipeControls
        onSwipe={swipe}
        onUndo={undo}
        canSwipe={isReady && Boolean(current)}
        canUndo={isReady && canUndo}
      />
      <p className="keyboard-help">
        Keyboard: <kbd>←</kbd> Nope · <kbd>↑</kbd> Friendzone · <kbd>→</kbd> Like · <kbd>Backspace</kbd> Undo
      </p>
    </section>
  );
}