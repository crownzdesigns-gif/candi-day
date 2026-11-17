import { createContext, useContext } from "react";

/**
 * Gates on-mount entrance animations (navbar, hero) until the loader has
 * finished its exit (spec §3.1 / §3.3). Defaults to `true` so entrances play
 * normally when no loader is mounted; the loader's provider flips it false →
 * true at the right moment.
 */
export const MotionReadyContext = createContext(true);

export const useMotionReady = (): boolean => useContext(MotionReadyContext);
