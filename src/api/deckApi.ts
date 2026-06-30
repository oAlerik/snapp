import { DeckResponse, DrawResponse } from '../types';

const BASE_URL = 'https://deckofcardsapi.com/api/deck';

export const initializeDeck = async (): Promise<DeckResponse> => {
  const response = await fetch(`${BASE_URL}/new/shuffle/?deck_count=1`);
  if (!response.ok) throw new Error(`Failed to initialize deck: ${response.status}`);

  const data: DeckResponse = await response.json();
  if (!data.success) throw new Error('Failed to initialize deck');

  return data;
};

export const reshuffleDeck = async (deckId: string): Promise<DeckResponse> => {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(deckId)}/shuffle/`);
  if (!response.ok) throw new Error(`Failed to reshuffle deck: ${response.status}`);

  const data: DeckResponse = await response.json();
  if (!data.success) throw new Error('Failed to reshuffle deck');

  return data;
};

export const drawCard = async (deckId: string): Promise<DrawResponse> => {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(deckId)}/draw/?count=1`);
  if (!response.ok) throw new Error(`Failed to draw card: ${response.status}`);

  const data: DrawResponse = await response.json();
  if (!data.success || !data.cards.length) throw new Error('Failed to draw card');
  
  return data;
};
