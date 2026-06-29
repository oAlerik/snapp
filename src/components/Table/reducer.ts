import { Card } from '../../types';
import { checkSnap, SnapResult } from '../../utils/game';

export interface GameState {
  deckId: string | null;
  currentCard: Card | null;
  previousCard: Card | null;
  remaining: number;
  drawnCount: number;
  snapMessage: SnapResult;
  totalValueMatches: number;
  totalSuitMatches: number;
  drawnCards: Card[];
  isInitializing: boolean;
  isDrawing: boolean;
  error: string | null;
}

export type Action =
  | { type: 'INIT_SUCCESS'; deckId: string }
  | { type: 'INIT_FAILURE' }
  | { type: 'DRAW_START' }
  | { type: 'DRAW_SUCCESS'; card: Card; remaining: number }
  | { type: 'DRAW_FAILURE' };

export const initialState: GameState = {
  deckId: null,
  currentCard: null,
  previousCard: null,
  remaining: 52,
  drawnCount: 0,
  snapMessage: null,
  totalValueMatches: 0,
  totalSuitMatches: 0,
  drawnCards: [],
  isInitializing: true,
  isDrawing: false,
  error: null,
};

export const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'INIT_SUCCESS':
      return { ...state, deckId: action.deckId, isInitializing: false };

    case 'INIT_FAILURE':
      return {
        ...state,
        isInitializing: false,
        error: 'Failed to initialize deck. Please refresh.',
      };

    case 'DRAW_START':
      return { ...state, isDrawing: true, error: null };

    case 'DRAW_SUCCESS': {
      const snap = state.currentCard ? checkSnap(action.card, state.currentCard) : null;
      return {
        ...state,
        isDrawing: false,
        previousCard: state.currentCard,
        currentCard: action.card,
        remaining: action.remaining,
        drawnCount: state.drawnCount + 1,
        snapMessage: snap,
        drawnCards: [...state.drawnCards, action.card],
        totalValueMatches: state.totalValueMatches + (snap === 'SNAP VALUE!' ? 1 : 0),
        totalSuitMatches: state.totalSuitMatches + (snap === 'SNAP SUIT!' ? 1 : 0),
      };
    }

    case 'DRAW_FAILURE':
      return {
        ...state,
        isDrawing: false,
        error: 'Failed to draw card. Please try again.',
      };
  }
};
