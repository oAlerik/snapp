export interface Card {
  code: string;
  image: string;
  value: string;
  suit: string;
}

export interface DeckResponse {
  deck_id: string;
  remaining: number;
  shuffled: boolean;
  success: boolean;
}

export interface DrawResponse {
  cards: Card[];
  remaining: number;
  success: boolean;
}
