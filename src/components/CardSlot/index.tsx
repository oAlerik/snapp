import { Card } from '../../types';
import styles from './CardSlot.module.scss';

interface Props {
  card: Card | null;
  label: string;
}

const CardSlot = ({ card, label }: Props) => (
  <div className={styles.cardSlot}>
    <p className={styles.label}>{label}</p>
    {card ? (
      <img
        className={styles.card}
        src={card.image}
        alt={`${card.value} of ${card.suit}`}
      />
    ) : (
      <div className={styles.placeholder} aria-label="No card yet" />
    )}
  </div>
);

export default CardSlot;
