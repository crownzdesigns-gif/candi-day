import type { Transition } from "motion/react";

/**
 * Framer Motion spring tokens — the only spring values used in the project.
 * Never inline ad-hoc spring numbers; reference these by name (spec §2.3).
 */
export const spring = {
  /** soft settle, tiny overshoot */
  pillowy: { type: "spring", stiffness: 260, damping: 18, mass: 0.9 },
  /** clear single bounce */
  bouncy: { type: "spring", stiffness: 400, damping: 12, mass: 0.8 },
  /** multi-oscillation wobble */
  jelly: { type: "spring", stiffness: 180, damping: 8, mass: 1.0 },
  /** underline swipe, fast feedback */
  snappy: { type: "spring", stiffness: 500, damping: 30, mass: 0.6 },
} satisfies Record<string, Transition>;

/** Toast entrance spring (spec §3.3 step 4). */
export const toastEnterSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 16,
};

/**
 * CSS cubic-bezier easings, mirrored here so JS-driven Framer animations can
 * reference the same curves as the stylesheet (spec §2.3).
 */
export const ease = {
  candyOut: [0.22, 1, 0.36, 1],
  candyInOut: [0.65, 0, 0.35, 1],
  overshoot: [0.34, 1.56, 0.64, 1],
} satisfies Record<string, [number, number, number, number]>;

/** Timing scale (ms). Exit animations run at ~70% of enter duration (spec §2.3). */
export const dur = {
  fast: 0.15,
  normal: 0.25,
  slow: 0.4,
} as const;

/** A 200ms opacity-only fade used as the universal reduced-motion entrance. */
export const reducedFade: Transition = { duration: 0.2, ease: "linear" };
