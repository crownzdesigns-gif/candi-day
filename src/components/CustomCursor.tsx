import { useEffect, useRef } from "react";
import { useReducedMotion } from "../motion/useReducedMotion";
import { usePointerFine } from "../motion/usePointerFine";
import "./CustomCursor.css";

const POOL = 18; // hard cap (spec §3.9)
const LIFE = 600; // particle lifetime (ms)
const SPAWN_DIST = 30; // spawn one particle per ~30px of movement
const PALETTE = ["#fc9bbe", "#fc9b7a", "#ebdeff", "#e3e770", "#ccd8ff"];

type Particle = { x: number; y: number; life: number };

export default function CustomCursor() {
  const reduced = useReducedMotion();
  const fine = usePointerFine();

  const dotRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const pointer = useRef({ x: -100, y: -100, seen: false });
  const dot = useRef({ x: -100, y: -100 });
  const pool = useRef<Particle[]>(Array.from({ length: POOL }, () => ({ x: 0, y: 0, life: 0 })));
  const lastSpawn = useRef({ x: -100, y: -100 });
  const next = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced || !fine) return; // native cursor; no trail

    document.body.classList.add("has-custom-cursor");

    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      if (!pointer.current.seen) {
        pointer.current.seen = true;
        dot.current.x = e.clientX;
        dot.current.y = e.clientY;
        lastSpawn.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };
    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = "1";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    let prev = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(48, now - prev);
      prev = now;

      // candy cursor lerps toward pointer at 0.35
      dot.current.x += (pointer.current.x - dot.current.x) * 0.35;
      dot.current.y += (pointer.current.y - dot.current.y) * 0.35;
      if (dotRef.current && pointer.current.seen) {
        dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0)`;
      }

      // spawn a pooled particle every ~SPAWN_DIST of pointer travel
      const sdx = pointer.current.x - lastSpawn.current.x;
      const sdy = pointer.current.y - lastSpawn.current.y;
      if (pointer.current.seen && sdx * sdx + sdy * sdy >= SPAWN_DIST * SPAWN_DIST) {
        const p = pool.current[next.current % POOL];
        p.x = pointer.current.x;
        p.y = pointer.current.y;
        p.life = LIFE;
        next.current++;
        lastSpawn.current = { x: pointer.current.x, y: pointer.current.y };
      }

      // advance + render the pool (transform/opacity only, recycled in place)
      for (let i = 0; i < POOL; i++) {
        const p = pool.current[i];
        const el = partRefs.current[i];
        if (!el) continue;
        if (p.life > 0) {
          p.life -= dt;
          const prog = 1 - Math.max(0, p.life) / LIFE; // 0 → 1
          el.style.opacity = String(1 - prog);
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${1 - 0.6 * prog})`;
        } else if (el.style.opacity !== "0") {
          el.style.opacity = "0";
        }
      }

      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [reduced, fine]);

  if (reduced || !fine) return null;

  return (
    <div className="cursor-layer" aria-hidden="true">
      {Array.from({ length: POOL }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            partRefs.current[i] = el;
          }}
          className="cursor-particle"
          style={{ background: PALETTE[i % PALETTE.length] }}
        />
      ))}
      <div className="cursor-dot" ref={dotRef} />
    </div>
  );
}
