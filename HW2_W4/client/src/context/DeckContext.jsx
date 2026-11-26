import { createContext, use } from 'react';
import { useProfiles } from '../hooks/useProfiles.js';
import { useSwipeSession } from '../hooks/useSwipeSession.js';

const DeckContext = createContext(null);

/**
 * One swipe session shared by every route (Deck + Matches), so switching
 * pages never loses the undo stack.
 */
export function DeckProvider({ children }) {
  const profilesState = useProfiles();
  const session = useSwipeSession(profilesState.profiles);
  return <DeckContext value={{ profilesState, ...session }}>{children}</DeckContext>;
}

export function useDeck() {
  const ctx = use(DeckContext);
  if (!ctx) throw new Error('useDeck must be used inside <DeckProvider>');
  return ctx;
}