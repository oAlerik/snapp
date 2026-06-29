import { Card } from '../types';

export type SnapResult = 'SNAP VALUE!' | 'SNAP SUIT!' | null;

export const checkSnap = (current: Card, previous: Card): SnapResult => {
  if (current.value === previous.value) return 'SNAP VALUE!';
  if (current.suit === previous.suit) return 'SNAP SUIT!';
  return null;
};

export interface Probability {
  value: number;
  suit: number;
}

export const calculateProbability = (
  currentCard: Card,
  drawnCards: Card[],
  remaining: number
): Probability => {
  if (remaining === 0) return { value: 0, suit: 0 };

  const valueDrawn = drawnCards.filter(c => c.value === currentCard.value).length;
  const suitDrawn = drawnCards.filter(c => c.suit === currentCard.suit).length;

  return {
    value: Math.max(0, 4 - valueDrawn) / remaining,
    suit: Math.max(0, 13 - suitDrawn) / remaining,
  };
};
