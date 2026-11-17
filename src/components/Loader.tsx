import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ease } from "../motion/tokens";
import "./Loader.css";

const TEXTS = ["Unwrapping sweetness…", "Loading sugar rush…", "Almost chewy…"];
const DURATION = 2100; // simulated load (1.8–2.4s range, spec §3.1)

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const [textIdx, setTextIdx] = useState(0);

  useEffect(() => {
    const done = setTimeout(onComplete, DURATION);
    const cycle = setInterval(() => setTextIdx((i) => (i + 1) % TEXTS.length), 800);
    return () => {
      clearTimeout(done);
      clearInterval(cycle);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="loader"
      initial={{ opacity: 1 }}
      exit={{ scale: 0.92, opacity: 0, transition: { duration: 0.3, ease: ease.candyOut } }}
    >
      <div className="loader__inner">
        <motion.div
          className="loader__wrapper"
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ duration: 1, ease: ease.candyInOut, repeat: Infinity }}
          aria-hidden="true"
        >
          🍬
        </motion.div>

        <div className="loader__bar">
          <div className="loader__bar-fill" />
        </div>

        <div className="loader__text-wrap">
          <AnimatePresence mode="wait">
            <motion.span
              key={textIdx}
              className="loader__text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {TEXTS[textIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
