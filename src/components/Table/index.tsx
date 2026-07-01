import { useEffect, useReducer } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Table.module.scss';
import { initializeDeck, reshuffleDeck, drawCard } from '../../api/deckApi';
import CardSlot from '../CardSlot';
import GameSummary from '../GameSummary';
import { calculateProbability } from '../../utils/game';
import { reducer, initialState } from './reducer';
import loader from '../../assets/images/loader.svg';

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

  const handleReset = () => {
    const previousDeckId = deckId!;
    dispatch({ type: 'RESET' });
    reshuffleDeck(previousDeckId)
      .then(data => dispatch({ type: 'INIT_SUCCESS', deckId: data.deck_id }))
      .catch(() => dispatch({ type: 'INIT_FAILURE' }));
  };

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

        {isInitializing && (
					<>
						<img
							src={loader}
							alt="loading..."
							className={styles.loader}
						/>
						<p className={styles.status}>Shuffling deck...</p>
					</>
				)}
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

            <div className={styles.snapContainer}>
              <AnimatePresence mode="wait">
                {snapMessage && (
                  <motion.p
                    key={snapMessage}
                    className={`${styles.snapMessage} ${
                      snapMessage === 'SNAP VALUE!' ? styles.snapValue : styles.snapSuit
                    }`}
                    role="status"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    {snapMessage}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

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
              <GameSummary
                totalValueMatches={totalValueMatches}
                totalSuitMatches={totalSuitMatches}
                onPlayAgain={handleReset}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Table;
