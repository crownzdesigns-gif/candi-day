import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Benefits from "./components/Benefits";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import CustomCursor from "./components/CustomCursor";
import CandyRain from "./components/CandyRain";
import { MotionReadyContext } from "./motion/ready";
import { useReducedMotion } from "./motion/useReducedMotion";
import { spring } from "./motion/tokens";

export default function App() {
  const reduced = useReducedMotion();
  // Reduced-motion users skip the loader entirely (spec §2.5 / §3.1).
  const [loaded, setLoaded] = useState(reduced);
  const onLoaderDone = useCallback(() => setLoaded(true), []);

  return (
    <MotionReadyContext.Provider value={loaded}>
      <Header />

      {/* Page reveal — header stays outside so its sticky positioning is intact.
          Scaling main+footer is safe (no fixed/sticky descendants). */}
      <motion.div
        initial={false}
        animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.02 }}
        transition={reduced ? { duration: 0 } : spring.pillowy}
        style={{ transformOrigin: "center top" }}
      >
        <main>
          <Hero />
          <Benefits />
        </main>
        <Footer />
      </motion.div>

      <AnimatePresence>
        {!loaded && <Loader key="loader" onComplete={onLoaderDone} />}
      </AnimatePresence>

      <CustomCursor />
      <CandyRain />
    </MotionReadyContext.Provider>
  );
}
