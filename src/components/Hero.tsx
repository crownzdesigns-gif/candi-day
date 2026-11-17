import { Fragment } from "react";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "../motion/useReducedMotion";
import { useMotionReady } from "../motion/ready";
import { spring, ease } from "../motion/tokens";
import { trigger } from "../motion/haptics";
import ToastArt from "./ToastArt";
import "./Hero.css";

const HEADLINE = "The Swedish Candi Cart Of Your Dreams";
const WORDS = HEADLINE.split(" ");

/* ---- Orchestrated entrance variants (spec §3.3) ---- */
const titleContainer = (reduced: boolean): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.1 },
  },
});

const wordVar = (reduced: boolean): Variants =>
  reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { y: 24, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: ease.candyOut } },
      };

const subVar = (reduced: boolean): Variants =>
  reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { y: 16, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: ease.candyOut, delay: 0.55 } },
      };

const ctaVar = (reduced: boolean): Variants =>
  reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { scale: 0.6, rotate: -4, opacity: 0 },
        visible: { scale: 1, rotate: 0, opacity: 1, transition: { ...spring.bouncy, delay: 0.8 } },
      };

const squiggleVar = (reduced: boolean): Variants =>
  reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2, delay: 0.4 } } }
    : {
        hidden: { clipPath: "inset(0 100% 0 0)", opacity: 1 },
        visible: {
          clipPath: "inset(0 0% 0 0)",
          opacity: 1,
          transition: { duration: 0.8, ease: ease.candyInOut, delay: 1.1 },
        },
      };

export default function Hero() {
  const reduced = useReducedMotion();
  const ready = useMotionReady();
  const animate = ready ? "visible" : "hidden";

  return (
    <section className="hero" id="top">
      <div className="hero__grid" aria-hidden="true" />

      <div className="hero__card">
        <div className="hero__text">
          <div className="hero__text-inner">
            <motion.h1
              className="hero__title"
              variants={titleContainer(reduced)}
              initial="hidden"
              animate={animate}
            >
              {WORDS.map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                  <motion.span className="hero__word" variants={wordVar(reduced)}>
                    {word}
                  </motion.span>
                  {i < WORDS.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </motion.h1>
            <motion.p
              className="hero__sub"
              variants={subVar(reduced)}
              initial="hidden"
              animate={animate}
            >
              Your go-to cart to call for events and catering, monthly candy club
              deliverables, online candy and more.
            </motion.p>
          </div>
          <motion.a
            href="#club"
            className="btn btn--periwinkle hero__cta"
            variants={ctaVar(reduced)}
            initial="hidden"
            animate={animate}
            whileHover={reduced ? undefined : { scaleX: 1.06, scaleY: 0.94, transition: spring.pillowy }}
            whileTap={reduced ? undefined : { scaleX: 1.1, scaleY: 0.88, transition: { duration: 0.12, ease: ease.candyOut } }}
            onPointerDown={() => trigger("press")}
          >
            <span>Join the club</span>
            <span className="btn__arrow" aria-hidden="true">→</span>
          </motion.a>
        </div>

        <motion.svg
          className="hero__squiggle"
          viewBox="0 0 203.097 124.747"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          variants={squiggleVar(reduced)}
          initial="hidden"
          animate={animate}
        >
          <path
            d="M202.569 65.1879C203.069 64.9049 203.245 64.27 202.963 63.7698L198.352 55.6171C198.069 55.1168 197.434 54.9406 196.934 55.2236C196.433 55.5065 196.257 56.1414 196.54 56.6417L200.638 63.8885L193.392 67.987C192.892 68.2699 192.715 68.9048 192.998 69.4051C193.281 69.9053 193.916 70.0816 194.417 69.7985L202.569 65.1879ZM0.164393 2.31435L0.328786 3.34197C7.98095 2.11782 24.6751 1.33269 43.0288 3.17266C61.3988 5.01427 81.2598 9.47019 95.3576 18.6131L95.9237 17.7401L96.4898 16.8669C81.9737 7.4521 61.7135 2.95402 43.2364 1.10168C24.7429 -0.752307 7.86439 0.0286361 0 1.28674L0.164393 2.31435ZM95.9237 17.7401L95.3576 18.6131C112.731 29.8809 122.835 41.9804 128.606 53.5822C134.378 65.1876 135.846 76.361 135.846 85.8243H136.887H137.928C137.928 76.139 136.424 64.6266 130.469 52.6553C124.513 40.6802 114.136 28.3119 96.4898 16.8669L95.9237 17.7401ZM136.887 85.8243H135.846C135.846 101.052 126.56 112.697 115.005 118.539C103.41 124.401 89.817 124.297 81.1967 116.438L80.496 117.207L79.7945 117.976C89.262 126.607 103.865 126.503 115.944 120.396C128.063 114.27 137.928 101.98 137.928 85.8243H136.887ZM80.496 117.207L81.1967 116.438C74.3455 110.193 70.7517 101.33 71.4989 92.0691C72.2447 82.8181 77.3337 73.0746 88.0326 65.1171L87.4116 64.282L86.7907 63.447C75.6776 71.7126 70.2251 81.9745 69.4245 91.9019C68.6244 101.819 72.4786 111.307 79.7945 117.976L80.496 117.207ZM87.4116 64.282L88.0326 65.1171C98.669 57.2058 114.621 53.7615 134.244 54.0626C153.842 54.3633 176.958 58.3972 201.778 65.2848L202.057 64.282L202.335 63.2792C177.413 56.3636 154.112 52.2858 134.276 51.9815C114.467 51.6776 97.9655 55.1349 86.7907 63.447L87.4116 64.282Z"
            fill="#702E25"
          />
        </motion.svg>

        <ToastArt />
      </div>

      {/* conveyor divider (spec §3.7): duplicated strip scrolls seamlessly */}
      <div className="hero__strip" aria-hidden="true">
        <div className="hero__strip-track">
          <img src="/assets/color-strip.png" alt="" />
          <img src="/assets/color-strip.png" alt="" />
        </div>
      </div>
    </section>
  );
}
