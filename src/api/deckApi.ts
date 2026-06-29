import { DeckResponse, DrawResponse } from '../types';

const BASE_URL = 'https://deckofcardsapi.com/api/deck';

export const initializeDeck = async (): Promise<DeckResponse> => {
  const response = await fetch(`${BASE_URL}/new/shuffle/?deck_count=1`);
  if (!response.ok) throw new Error(`Failed to initialize deck: ${response.status}`);
  return response.json();
};

export const drawCard = async (deckId: string): Promise<DrawResponse> => {
  const response = await fetch(`${BASE_URL}/${deckId}/draw/?count=1`);
  if (!response.ok) throw new Error(`Failed to draw card: ${response.status}`);
  return response.json();
};
