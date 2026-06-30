import styles from './GameSummary.module.scss';

interface Props {
  totalValueMatches: number;
  totalSuitMatches: number;
  onPlayAgain: () => void;
}

const GameSummary = ({ totalValueMatches, totalSuitMatches, onPlayAgain }: Props) => (
  <div className={styles.wrapper}>
    <div className={styles.summary} role="region" aria-label="Game summary">
      <h2>Game Over!</h2>
      <p>Total value matches: <strong>{totalValueMatches}</strong></p>
      <p>Total suit matches: <strong>{totalSuitMatches}</strong></p>
    </div>
    <button className={styles.playAgain} onClick={onPlayAgain}>
      Play Again
    </button>
  </div>
);

export default GameSummary;
