import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "../motion/useReducedMotion";
import { spring, ease } from "../motion/tokens";
import { trigger } from "../motion/haptics";
import "./Footer.css";

const COLUMNS = [
  {
    title: "For Treats",
    items: ["Shop candy", "Catering", "Monthly club", "Gift carts"],
  },
  {
    title: "For Events",
    items: ["Book a cart", "Corporate events", "Weddings", "Party packages"],
  },
  {
    title: "Important Stuff",
    items: ["FAQs", "Contact us", "Privacy Policy"],
  },
];

const WORDMARK = "candi-licious";

/* Wordmark ripple: container staggers letters left→right (spec §3.12). */
const wordmarkContainer: Variants = {
  rest: {},
  hover: { transition: { staggerChildren: 0.04 } },
  tap: { transition: { staggerChildren: 0.04 } },
};
const letterVar = (reduced: boolean): Variants =>
  reduced
    ? { rest: {}, hover: {}, tap: {} }
    : {
        rest: { scaleY: 1, y: 0 },
        hover: {
          scaleY: [1, 0.7, 1.3, 1],
          y: [0, 4, -8, 0],
          transition: { duration: 0.5, ease: ease.candyOut },
        },
        tap: {
          scaleY: [1, 0.6, 1.45, 0.9, 1],
          y: [0, 5, -12, 3, 0],
          transition: { duration: 0.6, ease: ease.candyOut },
        },
      };

export default function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const reduced = useReducedMotion();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    trigger("success");
    setJoined(true);
  };

  const marshmallow = reduced
    ? undefined
    : {
        scaleY: [1, 0.82, 1.12, 0.96, 1],
        scaleX: [1, 1.14, 0.92, 1.03, 1],
        transition: { duration: 0.6, ease: ease.candyInOut, times: [0, 0.2, 0.45, 0.7, 1] },
      };

  return (
    <footer className="footer" id="shop">
      <motion.div
        className="footer__menu"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
        whileInView={reduced ? { opacity: 1, transition: { duration: 0.2 } } : { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.candyOut } }}
        viewport={{ once: true, amount: 0.2 }}
      >
        {COLUMNS.map((col) => (
          <nav key={col.title} className="footer__col" aria-label={col.title}>
            <h2 className="footer__col-title">{col.title}</h2>
            <ul>
              {col.items.map((item) => (
                <li key={item}>
                  <a href="#" className="footer__link">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Newsletter */}
        <div className="newsletter" id="events">
          <motion.span
            className="newsletter__candy"
            aria-hidden="true"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
            whileInView={reduced ? { opacity: 1, transition: { duration: 0.2 } } : { opacity: 1, y: 0, transition: spring.bouncy }}
            viewport={{ once: true, amount: 0.6 }}
          >
            🍬
          </motion.span>
          <h2 className="newsletter__title">Join the Newsletter</h2>
          <p className="newsletter__copy">
            Sweet deals straight to your inbox. Loved by 5k+ candy lovers and
            counting!
          </p>

          {joined ? (
            <p className="newsletter__success" role="status">
              You're in! 🍬 Watch your inbox for sweet stuff.
            </p>
          ) : (
            <form className="newsletter__form" onSubmit={onSubmit}>
              <div className="newsletter__field">
                <input
                  id="nl-email"
                  className="newsletter__input"
                  type="email"
                  required
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="newsletter__label" htmlFor="nl-email">
                  Email address
                </label>
              </div>
              <motion.button
                type="submit"
                className="newsletter__btn"
                whileHover={marshmallow}
                whileTap={marshmallow}
                onPointerDown={() => trigger("press")}
              >
                Join <span className="btn__arrow" aria-hidden="true">→</span>
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>

      <motion.div
        className="footer__wordmark"
        aria-hidden="true"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
        whileInView={reduced ? { opacity: 1, transition: { duration: 0.2 } } : { opacity: 1, scale: 1, transition: spring.jelly }}
        viewport={{ once: true, amount: 0.5 }}
      >
        <motion.span
          className="footer__wordmark-inner"
          variants={wordmarkContainer}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          {Array.from(WORDMARK).map((ch, i) => (
            <motion.span key={`${ch}-${i}`} className="wordmark__letter" variants={letterVar(reduced)}>
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </motion.div>

      <div className="footer__copyright">
        <p>Copyright Candilicious LLC 2026 · Site Credit · Candilicious</p>
      </div>
    </footer>
  );
}
