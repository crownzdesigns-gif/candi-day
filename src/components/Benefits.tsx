import { motion, type TargetAndTransition } from "motion/react";
import { useReducedMotion } from "../motion/useReducedMotion";
import { spring } from "../motion/tokens";
import "./Benefits.css";

/* ---- Scroll-reveal props per card, staggered by DOM index (spec §3.8) ---- */
function reveal(reduced: boolean, idx: number) {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1, transition: { duration: 0.2, delay: idx * 0.03 } },
      viewport: { once: true, amount: 0.2 },
    } as const;
  }
  return {
    initial: { opacity: 0, scale: 0.92, y: 20 },
    whileInView: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { ...spring.bouncy, delay: idx * 0.06 },
    },
    viewport: { once: true, amount: 0.2 },
  } as const;
}

/* ---- Shared base hover: card lifts -6px (spec §3.6). Inner image/text
       effects live in CSS so each element keeps exactly one transform writer. */
const baseHover = (reduced: boolean): TargetAndTransition | undefined =>
  reduced ? undefined : { y: -6, transition: spring.pillowy };

const tap = (reduced: boolean): TargetAndTransition | undefined =>
  reduced ? undefined : { scale: 0.97, transition: spring.pillowy };

/* ---- Unique tile-level hovers (additive on top of the lift) ---- */
// Card 1 — rainbow gummy: jelly wobble (scale + skew keyframes).
const rainbowHover = (reduced: boolean): TargetAndTransition | undefined =>
  reduced
    ? undefined
    : {
        y: -6,
        scale: [1, 1.04, 0.98, 1.02, 1],
        skewX: [0, 1.5, -1, 0.5, 0],
        transition: {
          y: spring.pillowy,
          scale: { duration: 0.55, ease: "easeInOut" },
          skewX: { duration: 0.55, ease: "easeInOut" },
        },
      };

export default function Benefits() {
  const reduced = useReducedMotion();

  // Card 5 — candy landscape: pointer-driven background pan (CSS vars × 0.06,
  // clamped to the card). One writer (the CSS rule) reading JS-set vars.
  const onPan = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // [-0.5, 0.5]
    const py = (e.clientY - r.top) / r.height - 0.5;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v * 2));
    e.currentTarget.style.setProperty("--panx", `${clamp(px) * 14}px`);
    e.currentTarget.style.setProperty("--pany", `${clamp(py) * 14}px`);
  };
  const resetPan = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--panx", "0px");
    e.currentTarget.style.setProperty("--pany", "0px");
  };

  return (
    <section className="benefits" id="club">
      <div className="benefits__inner">
        <motion.header
          className="benefits__head"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 18 }}
          whileInView={reduced ? { opacity: 1, transition: { duration: 0.2 } } : { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="benefits__heading">
            <span className="benefits__eyebrow">Benefit</span>
            <h2 className="benefits__title">Your gut knows, so does your Candy</h2>
          </div>
          <a href="#shop" className="btn btn--lilac">
            <span>Browse more</span>
            <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
        </motion.header>

        <div className="bento">
          {/* Column 1 */}
          <div className="bento__col">
            {/* Card 1 — rainbow gummy */}
            <motion.figure
              className="tile tile--olive"
              {...reveal(reduced, 0)}
              whileHover={rainbowHover(reduced)}
              whileTap={tap(reduced)}
            >
              <img src="/assets/rainbow-belt.png" alt="A coil of rainbow sour belt candy." />
            </motion.figure>
            {/* Card 4 — bubble gum */}
            <motion.figure
              className="tile tile--coral tile--tall tile--gum"
              {...reveal(reduced, 1)}
              whileHover={baseHover(reduced)}
              whileTap={tap(reduced)}
            >
              <img className="tile__img-contain" src="/assets/hubba-bubba.png" alt="A wheel of Hubba Bubba Bubble Tape gum." />
            </motion.figure>
          </div>

          {/* Column 2 */}
          <div className="bento__col">
            {/* Card 2 — text card (continuous breathe) */}
            <motion.div
              className="tile tile--pink tile--quote tile--breathe"
              {...reveal(reduced, 2)}
              whileHover={baseHover(reduced)}
              whileTap={tap(reduced)}
            >
              <p>One candy a day makes the mind rich, and the body strong!</p>
            </motion.div>
            {/* Card 5 — candy landscape (pointer pan) */}
            <motion.figure
              className="tile tile--periwinkle tile--pan"
              {...reveal(reduced, 3)}
              whileHover={baseHover(reduced)}
              whileTap={tap(reduced)}
              onPointerMove={onPan}
              onPointerLeave={resetPan}
            >
              <img className="tile__img-cover" src="/assets/candyland.png" alt="A whimsical candy landscape of lollipops and gumdrops." />
            </motion.figure>
            {/* Card 6 — club card (text lift + glow) */}
            <motion.div
              className="tile tile--butter tile--quote tile--club"
              {...reveal(reduced, 4)}
              whileHover={baseHover(reduced)}
              whileTap={tap(reduced)}
            >
              <p>Join the free club for access to healthy candies and gum.</p>
            </motion.div>
          </div>

          {/* Column 3 */}
          <div className="bento__col">
            {/* Card 3 — wrapped candy (img rotate) */}
            <motion.figure
              className="tile tile--lime tile--tall tile--wrapped"
              {...reveal(reduced, 5)}
              whileHover={baseHover(reduced)}
              whileTap={tap(reduced)}
            >
              <img className="tile__img-contain" src="/assets/wrapped-candy.png" alt="A pink-and-white striped wrapped hard candy." />
            </motion.figure>
            {/* Card 7 — sky card (cloud drift) */}
            <motion.figure
              className="tile tile--coral tile--sky"
              {...reveal(reduced, 6)}
              whileHover={baseHover(reduced)}
              whileTap={tap(reduced)}
            >
              <img className="tile__img-cover" src="/assets/clouds.png" alt="A bright blue sky with fluffy clouds and a red swirl lollipop." />
            </motion.figure>
          </div>
        </div>
      </div>
    </section>
  );
}
