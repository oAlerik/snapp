import { reducer, initialState, GameState } from './reducer';
import { Card } from '../../types';

const makeCard = (value: string, suit: string): Card => ({
  code: `${value[0]}${suit[0]}`,
  image: 'https://example.com/card.png',
  value,
  suit,
});

describe('reducer', () => {
  describe('INIT_SUCCESS', () => {
    it('sets deckId and clears isInitializing', () => {
      const state = reducer(initialState, { type: 'INIT_SUCCESS', deckId: 'abc123' });
      expect(state.deckId).toBe('abc123');
      expect(state.isInitializing).toBe(false);
    });
  });

  describe('INIT_FAILURE', () => {
    it('clears isInitializing and sets an error message', () => {
      const state = reducer(initialState, { type: 'INIT_FAILURE' });
      expect(state.isInitializing).toBe(false);
      expect(state.error).toMatch(/failed to initialize/i);
    });
  });

  describe('DRAW_START', () => {
    it('sets isDrawing and clears any previous error', () => {
      const withError: GameState = { ...initialState, error: 'oops' };
      const state = reducer(withError, { type: 'DRAW_START' });
      expect(state.isDrawing).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('DRAW_SUCCESS', () => {
    const ready: GameState = { ...initialState, isInitializing: false, deckId: 'abc123' };
    const firstCard = makeCard('5', 'HEARTS');

    it('sets currentCard and clears isDrawing', () => {
      const state = reducer(ready, { type: 'DRAW_SUCCESS', card: firstCard, remaining: 51 });
      expect(state.currentCard).toEqual(firstCard);
      expect(state.isDrawing).toBe(false);
    });

    it('increments drawnCount and updates remaining', () => {
      const state = reducer(ready, { type: 'DRAW_SUCCESS', card: firstCard, remaining: 51 });
      expect(state.drawnCount).toBe(1);
      expect(state.remaining).toBe(51);
    });

    it('moves currentCard to previousCard on second draw', () => {
      const afterFirst = reducer(ready, { type: 'DRAW_SUCCESS', card: firstCard, remaining: 51 });
      const secondCard = makeCard('7', 'SPADES');
      const afterSecond = reducer(afterFirst, { type: 'DRAW_SUCCESS', card: secondCard, remaining: 50 });
      expect(afterSecond.previousCard).toEqual(firstCard);
      expect(afterSecond.currentCard).toEqual(secondCard);
    });

    it('sets no snap message on first draw (no previous card)', () => {
      const state = reducer(ready, { type: 'DRAW_SUCCESS', card: firstCard, remaining: 51 });
      expect(state.snapMessage).toBeNull();
    });

    it('sets SNAP VALUE! when drawn card value matches previous', () => {
      const afterFirst = reducer(ready, { type: 'DRAW_SUCCESS', card: firstCard, remaining: 51 });
      const matchingValue = makeCard('5', 'SPADES');
      const state = reducer(afterFirst, { type: 'DRAW_SUCCESS', card: matchingValue, remaining: 50 });
      expect(state.snapMessage).toBe('SNAP VALUE!');
      expect(state.totalValueMatches).toBe(1);
      expect(state.totalSuitMatches).toBe(0);
    });

    it('sets SNAP SUIT! when drawn card suit matches previous', () => {
      const afterFirst = reducer(ready, { type: 'DRAW_SUCCESS', card: firstCard, remaining: 51 });
      const matchingSuit = makeCard('7', 'HEARTS');
      const state = reducer(afterFirst, { type: 'DRAW_SUCCESS', card: matchingSuit, remaining: 50 });
      expect(state.snapMessage).toBe('SNAP SUIT!');
      expect(state.totalSuitMatches).toBe(1);
      expect(state.totalValueMatches).toBe(0);
    });

    it('clears snap message when next draw has no match', () => {
      const afterFirst = reducer(ready, { type: 'DRAW_SUCCESS', card: firstCard, remaining: 51 });
      const matchingValue = makeCard('5', 'SPADES');
      const afterSnap = reducer(afterFirst, { type: 'DRAW_SUCCESS', card: matchingValue, remaining: 50 });
      const noMatch = makeCard('9', 'CLUBS');
      const state = reducer(afterSnap, { type: 'DRAW_SUCCESS', card: noMatch, remaining: 49 });
      expect(state.snapMessage).toBeNull();
    });

    it('accumulates match totals across multiple draws', () => {
      let state = ready;
      state = reducer(state, { type: 'DRAW_SUCCESS', card: makeCard('5', 'HEARTS'), remaining: 51 });
      state = reducer(state, { type: 'DRAW_SUCCESS', card: makeCard('5', 'SPADES'), remaining: 50 }); // value snap
      state = reducer(state, { type: 'DRAW_SUCCESS', card: makeCard('9', 'SPADES'), remaining: 49 }); // suit snap
      state = reducer(state, { type: 'DRAW_SUCCESS', card: makeCard('3', 'CLUBS'), remaining: 48 }); // no snap
      expect(state.totalValueMatches).toBe(1);
      expect(state.totalSuitMatches).toBe(1);
    });

    it('tracks draw counts by value and suit', () => {
      let state = ready;
      state = reducer(state, { type: 'DRAW_SUCCESS', card: firstCard, remaining: 51 });
      state = reducer(state, { type: 'DRAW_SUCCESS', card: makeCard('5', 'CLUBS'), remaining: 50 });
      expect(state.drawCounts.byValue['5']).toBe(2);
      expect(state.drawCounts.bySuit['HEARTS']).toBe(1);
      expect(state.drawCounts.bySuit['CLUBS']).toBe(1);
    });
  });

  describe('RESET', () => {
    it('returns state to initial', () => {
      let state: GameState = { ...initialState, isInitializing: false, deckId: 'abc123' };
      state = reducer(state, { type: 'DRAW_SUCCESS', card: makeCard('5', 'HEARTS'), remaining: 51 });
      state = reducer(state, { type: 'DRAW_SUCCESS', card: makeCard('5', 'SPADES'), remaining: 50 });
      state = reducer(state, { type: 'RESET' });
      expect(state).toEqual(expect.objectContaining({
        currentCard: null,
        previousCard: null,
        drawnCount: 0,
        totalValueMatches: 0,
        totalSuitMatches: 0,
        drawCounts: { byValue: {}, bySuit: {} },
        isInitializing: true,
      }));
    });
  });

  describe('DRAW_FAILURE', () => {
    it('clears isDrawing and sets an error message', () => {
      const drawing: GameState = { ...initialState, isDrawing: true };
      const state = reducer(drawing, { type: 'DRAW_FAILURE' });
      expect(state.isDrawing).toBe(false);
      expect(state.error).toMatch(/failed to draw/i);
    });
  });
});
