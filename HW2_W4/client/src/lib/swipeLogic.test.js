import { describe, expect, it } from 'vitest';
import {
  ACTIONS,
  computeScore,
  computeStats,
  getGestureDirection,
  getRemainingProfiles,
  initialSwipeState,
  swipeReducer,
} from './swipeLogic.js';

const entry = (n, action, profileSlug = `p${n}`) => ({ clientId: `c${n}`, profileSlug, action });
const profiles = [{ slug: 'p1' }, { slug: 'p2' }, { slug: 'p3' }];

describe('computeScore (asymmetric, derived)', () => {
  it('is 0 for an empty history', () => {
    expect(computeScore([])).toBe(0);
  });

  it('adds 10 per LIKE and subtracts 5 for NOPE and FRIENDZONE', () => {
    const history = [entry(1, 'LIKE'), entry(2, 'NOPE'), entry(3, 'FRIENDZONE'), entry(4, 'LIKE')];
    expect(computeScore(history)).toBe(10 - 5 - 5 + 10);
  });

  it('can go negative', () => {
    expect(computeScore([entry(1, 'NOPE'), entry(2, 'NOPE')])).toBe(-10);
  });
});

describe('computeStats', () => {
  it('counts each action', () => {
    expect(computeStats([entry(1, 'LIKE'), entry(2, 'LIKE'), entry(3, 'NOPE')])).toEqual({
      LIKE: 2,
      NOPE: 1,
      FRIENDZONE: 0,
    });
  });
});

describe('getRemainingProfiles', () => {
  it('removes decided profiles and keeps deck order', () => {
    expect(getRemainingProfiles(profiles, [entry(1, 'LIKE', 'p2')]).map((p) => p.slug)).toEqual(['p1', 'p3']);
  });
});

describe('getGestureDirection', () => {
  it('returns null inside the threshold', () => {
    expect(getGestureDirection(40, -30)).toBeNull();
  });
  it('detects right, left and up', () => {
    expect(getGestureDirection(120, 10)).toBe('right');
    expect(getGestureDirection(-120, 10)).toBe('left');
    expect(getGestureDirection(10, -120)).toBe('up');
  });
  it('lets horizontal win on a mostly-horizontal diagonal', () => {
    expect(getGestureDirection(130, -90)).toBe('right');
  });
  it('ignores downward drags', () => {
    expect(getGestureDirection(0, 200)).toBeNull();
  });
});

describe('swipeReducer — LIFO undo stack', () => {
  it('pushes on SWIPE and pops the LAST entry on UNDO', () => {
    let state = initialSwipeState;
    state = swipeReducer(state, { type: 'SWIPE', entry: entry(1, ACTIONS.LIKE) });
    state = swipeReducer(state, { type: 'SWIPE', entry: entry(2, ACTIONS.NOPE) });
    state = swipeReducer(state, { type: 'UNDO' });
    expect(state.history).toEqual([entry(1, ACTIONS.LIKE)]);
  });

  it('restores cards in reverse order of swiping', () => {
    let state = initialSwipeState;
    for (const n of [1, 2, 3]) state = swipeReducer(state, { type: 'SWIPE', entry: entry(n, 'LIKE') });
    const restored = [];
    for (let i = 0; i < 3; i++) {
      restored.push(state.history.at(-1).profileSlug);
      state = swipeReducer(state, { type: 'UNDO' });
    }
    expect(restored).toEqual(['p3', 'p2', 'p1']);
  });

  it('UNDO on an empty stack returns the same state', () => {
    expect(swipeReducer(initialSwipeState, { type: 'UNDO' })).toBe(initialSwipeState);
  });

  it('never mutates the previous state', () => {
    const before = { history: [entry(1, 'LIKE')] };
    swipeReducer(before, { type: 'SWIPE', entry: entry(2, 'NOPE') });
    expect(before.history).toHaveLength(1);
  });

  it('ignores a second swipe on the same profile', () => {
    const state = { history: [entry(1, 'LIKE', 'p1')] };
    expect(swipeReducer(state, { type: 'SWIPE', entry: entry(2, 'NOPE', 'p1') })).toBe(state);
  });

  it('ROLLBACK_SWIPE removes exactly the rejected entry', () => {
    const state = { history: [entry(1, 'LIKE'), entry(2, 'NOPE'), entry(3, 'LIKE')] };
    expect(swipeReducer(state, { type: 'ROLLBACK_SWIPE', clientId: 'c2' }).history.map((e) => e.clientId)).toEqual([
      'c1',
      'c3',
    ]);
  });

  it('RESTORE_ENTRY pushes an entry back on top', () => {
    const state = { history: [entry(1, 'LIKE')] };
    expect(swipeReducer(state, { type: 'RESTORE_ENTRY', entry: entry(2, 'NOPE') }).history).toHaveLength(2);
  });

  it('HYDRATE replaces the history', () => {
    expect(swipeReducer(initialSwipeState, { type: 'HYDRATE', history: [entry(9, 'LIKE')] }).history).toHaveLength(1);
  });

  it('throws on unknown events', () => {
    expect(() => swipeReducer(initialSwipeState, { type: 'NOPE' })).toThrow(/Unknown/);
  });
});