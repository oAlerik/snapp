import { motion } from 'framer-motion';
import styles from './ShuffleAnimation.module.scss';
import backCard from '../../assets/images/back.png';

const CARDS = [
  { rotate: -22, x: -32, zIndex: 1 },
  { rotate: -11, x: -16, zIndex: 2 },
  { rotate:   0, x:   0, zIndex: 3 },
  { rotate:  11, x:  16, zIndex: 2 },
  { rotate:  22, x:  32, zIndex: 1 },
];

const ShuffleAnimation = () => (
  <div className={styles.wrapper} aria-hidden="true">
    {CARDS.map((cfg, i) => (
      <motion.img
        key={i}
        className={styles.card}
        src={backCard}
        alt=""
        style={{ zIndex: cfg.zIndex }}
        animate={{
          rotate: [0, cfg.rotate, 0],
          x: [0, cfg.x, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 0.9,
          repeat: Infinity,
          repeatDelay: 0.4,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        }}
      />
    ))}
  </div>
);

export default ShuffleAnimation;
