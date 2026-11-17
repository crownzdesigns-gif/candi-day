import { useEffect, useState } from "react";

const QUERY = "(pointer: fine) and (hover: hover)";

/**
 * Single shared fine-pointer hook (spec §2.5). True only for precise pointers
 * that can hover (mouse/trackpad). Coarse/touch pointers read false so the
 * custom cursor and hover-only effects are skipped and tap fallbacks apply.
 */
export function usePointerFine(): boolean {
  const [fine, setFine] = useState(() =>
    typeof window !== "undefined" && "matchMedia" in window
      ? window.matchMedia(QUERY).matches
      : true,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setFine(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return fine;
}
