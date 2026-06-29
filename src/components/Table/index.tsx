import { useEffect, useReducer } from 'react';
import styles from './Table.module.scss';
import { initializeDeck, drawCard } from '../../api/deckApi';
import CardSlot from '../CardSlot';
import { calculateProbability } from '../../utils/game';
import { reducer, initialState } from './reducer';

const Table: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    deckId, currentCard, previousCard, remaining, drawnCount,
    snapMessage, totalValueMatches, totalSuitMatches, drawCounts,
    isInitializing, isDrawing, error,
  } = state;

  useEffect(() => {
    initializeDeck()
      .then(data => dispatch({ type: 'INIT_SUCCESS', deckId: data.deck_id }))
      .catch(() => dispatch({ type: 'INIT_FAILURE' }));
  }, []);

  const handleDraw = async () => {
    if (!deckId || isDrawing) return;
    dispatch({ type: 'DRAW_START' });
    try {
      const data = await drawCard(deckId);
      dispatch({ type: 'DRAW_SUCCESS', card: data.cards[0], remaining: data.remaining });
    } catch {
      dispatch({ type: 'DRAW_FAILURE' });
    }
  };

  const gameOver = remaining === 0 && drawnCount > 0;
  const probability =
    currentCard && !gameOver
      ? calculateProbability(currentCard, drawCounts, remaining)
      : null;

  return (
    <div className={styles.table}>
      <div className={styles.playMat}>
        <h1 className={styles.title}>SNAP!</h1>

        {isInitializing && <p className={styles.status}>Shuffling deck...</p>}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {!isInitializing && (
          <>
            {drawnCount > 0 && (
              <p className={styles.counter}>
                {gameOver ? 'All 52 cards drawn!' : `Card ${drawnCount} of 52`}
              </p>
            )}

            <div className={styles.cardsArea}>
              <CardSlot card={previousCard} label="Previous Card" />
              <CardSlot card={currentCard} label="Current Card" />
            </div>

            {snapMessage && (
              <p
                className={`${styles.snapMessage} ${
                  snapMessage === 'SNAP VALUE!' ? styles.snapValue : styles.snapSuit
                }`}
                role="status"
              >
                {snapMessage}
              </p>
            )}

            {!gameOver && (
              <button
                className={styles.drawButton}
                onClick={handleDraw}
                disabled={isDrawing || !deckId}
              >
                {isDrawing ? 'Drawing...' : 'Draw Card'}
              </button>
            )}

            {probability && (
              <div className={styles.probability}>
                <p>Next card probability</p>
                <p>Value match: {(probability.value * 100).toFixed(1)}%</p>
                <p>Suit match: {(probability.suit * 100).toFixed(1)}%</p>
              </div>
            )}

            {gameOver && (
              <div className={styles.summary} role="region" aria-label="Game summary">
                <h2>Game Over!</h2>
                <p>Total value matches: <strong>{totalValueMatches}</strong></p>
                <p>Total suit matches: <strong>{totalSuitMatches}</strong></p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Table;
