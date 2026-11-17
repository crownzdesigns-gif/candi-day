import { useEffect, useRef } from "react";

/**
 * Adds `is-visible` to the element (and any `.reveal` descendants) once it
 * scrolls into view. Children can stagger via a `--reveal-delay` custom prop.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.classList.contains("reveal")
      ? [el, ...Array.from(el.querySelectorAll<HTMLElement>(".reveal"))]
      : Array.from(el.querySelectorAll<HTMLElement>(".reveal"));

    if (!targets.length) return;

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    }, options);

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
