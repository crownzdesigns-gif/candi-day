import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Single shared reduced-motion hook (spec §2.5). Every continuous system reads
 * this; when true, continuous motion is killed and entrances become fades.
 * Reads `matchMedia` lazily so there is no hydration mismatch in CSR.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && "matchMedia" in window
      ? window.matchMedia(QUERY).matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
