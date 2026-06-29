import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Table from './';
import { initializeDeck, drawCard } from '../../api/deckApi';

jest.mock('../../api/deckApi');
const mockInitializeDeck = initializeDeck as jest.Mock;
const mockDrawCard = drawCard as jest.Mock;

const DECK_ID = 'test-deck-id';

const mockDeck = { deck_id: DECK_ID, remaining: 52, shuffled: true, success: true };

const drawResponse = (value: string, suit: string, remaining: number) => ({
  cards: [{ code: `${value[0]}${suit[0]}`, image: 'img.png', value, suit }],
  remaining,
  success: true,
});

beforeEach(() => {
  mockInitializeDeck.mockResolvedValue(mockDeck);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Table', () => {
  it('shows loading state while deck initialises', () => {
    mockInitializeDeck.mockReturnValue(new Promise(() => {}));
    render(<Table />);
    expect(screen.getByText('Shuffling deck...')).toBeInTheDocument();
  });

  it('shows Draw Card button once deck is ready', async () => {
    render(<Table />);
    expect(await screen.findByRole('button', { name: /draw card/i })).toBeInTheDocument();
  });

  it('shows error alert when initialisation fails', async () => {
    mockInitializeDeck.mockRejectedValue(new Error('Network error'));
    render(<Table />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to initialize/i);
  });

  it('displays the drawn card image after clicking Draw Card', async () => {
    mockDrawCard.mockResolvedValue(drawResponse('5', 'HEARTS', 51));
    render(<Table />);
    fireEvent.click(await screen.findByRole('button', { name: /draw card/i }));
    expect(await screen.findByAltText('5 of HEARTS')).toBeInTheDocument();
  });

  it('shows placeholders for both card slots before first draw', async () => {
    render(<Table />);
    await screen.findByRole('button', { name: /draw card/i });
    expect(screen.getAllByLabelText('No card yet')).toHaveLength(2);
  });

  it('removes the Draw Card button and shows summary when all cards are drawn', async () => {
    mockDrawCard.mockResolvedValue(drawResponse('5', 'HEARTS', 0));
    render(<Table />);
    fireEvent.click(await screen.findByRole('button', { name: /draw card/i }));
    const summary = await screen.findByRole('region', { name: /game summary/i });
    expect(summary).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /draw card/i })).not.toBeInTheDocument();
  });

  it('shows error alert when a draw fails', async () => {
    mockDrawCard.mockRejectedValue(new Error('Network error'));
    render(<Table />);
    fireEvent.click(await screen.findByRole('button', { name: /draw card/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to draw/i);
  });
});
