import { checkSnap, calculateProbability, DrawCounts } from './game';
import { Card } from '../types';

const makeCard = (value: string, suit: string): Card => ({
  code: `${value[0]}${suit[0]}`,
  image: 'https://example.com/card.png',
  value,
  suit,
});

const makeCounts = (cards: Card[]): DrawCounts =>
  cards.reduce<DrawCounts>(
    (acc, c) => ({
      byValue: { ...acc.byValue, [c.value]: (acc.byValue[c.value] ?? 0) + 1 },
      bySuit: { ...acc.bySuit, [c.suit]: (acc.bySuit[c.suit] ?? 0) + 1 },
    }),
    { byValue: {}, bySuit: {} }
  );

describe('checkSnap', () => {
  it('returns SNAP VALUE! when card values match', () => {
    expect(checkSnap(makeCard('5', 'HEARTS'), makeCard('5', 'SPADES'))).toBe('SNAP VALUE!');
  });

  it('returns SNAP SUIT! when card suits match', () => {
    expect(checkSnap(makeCard('5', 'HEARTS'), makeCard('7', 'HEARTS'))).toBe('SNAP SUIT!');
  });

  it('returns null when neither value nor suit match', () => {
    expect(checkSnap(makeCard('5', 'HEARTS'), makeCard('7', 'SPADES'))).toBeNull();
  });

  it('returns SNAP VALUE! (not SNAP SUIT!) when both value and suit match', () => {
    expect(checkSnap(makeCard('5', 'HEARTS'), makeCard('5', 'HEARTS'))).toBe('SNAP VALUE!');
  });

  it('returns SNAP VALUE! for face card value matches', () => {
    expect(checkSnap(makeCard('KING', 'HEARTS'), makeCard('KING', 'CLUBS'))).toBe('SNAP VALUE!');
  });

  it('returns SNAP SUIT! for ace suit match', () => {
    expect(checkSnap(makeCard('ACE', 'DIAMONDS'), makeCard('2', 'DIAMONDS'))).toBe('SNAP SUIT!');
  });
});

describe('calculateProbability', () => {
  it('returns zero probability when no cards remain', () => {
    const card = makeCard('5', 'HEARTS');
    expect(calculateProbability(card, makeCounts([card]), 0)).toEqual({ value: 0, suit: 0 });
  });

  it('calculates correct value probability after drawing one card of that value', () => {
    const current = makeCard('5', 'HEARTS');
    const prob = calculateProbability(current, makeCounts([current]), 51);
    expect(prob.value).toBeCloseTo(3 / 51);
  });

  it('calculates correct suit probability after drawing one card of that suit', () => {
    const current = makeCard('5', 'HEARTS');
    const prob = calculateProbability(current, makeCounts([current]), 51);
    expect(prob.suit).toBeCloseTo(12 / 51);
  });

  it('accounts for multiple drawn cards of the same value', () => {
    const current = makeCard('5', 'HEARTS');
    const drawn = [makeCard('5', 'CLUBS'), makeCard('5', 'DIAMONDS'), current];
    const prob = calculateProbability(current, makeCounts(drawn), 49);
    expect(prob.value).toBeCloseTo(1 / 49);
  });

  it('returns zero value probability when all cards of that value are drawn', () => {
    const current = makeCard('5', 'HEARTS');
    const drawn = [makeCard('5', 'CLUBS'), makeCard('5', 'DIAMONDS'), makeCard('5', 'SPADES'), current];
    const prob = calculateProbability(current, makeCounts(drawn), 48);
    expect(prob.value).toBe(0);
  });

  it('calculates probability correctly at game start (first card drawn)', () => {
    const current = makeCard('ACE', 'SPADES');
    const prob = calculateProbability(current, makeCounts([current]), 51);
    expect(prob.value).toBeCloseTo(3 / 51);
    expect(prob.suit).toBeCloseTo(12 / 51);
  });
});
