import { useEffect, useRef } from "react";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "../motion/useReducedMotion";
import { useMotionReady } from "../motion/ready";
import { usePointerFine } from "../motion/usePointerFine";
import { toastEnterSpring } from "../motion/tokens";

/** Toast entrance (spec §3.3 step 4): slides + un-rotates into place. */
const toastVar = (reduced: boolean): Variants =>
  reduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : {
        hidden: { x: 80, rotate: 6, opacity: 0 },
        visible: { x: 0, rotate: 0, opacity: 1, transition: { ...toastEnterSpring, delay: 0.5 } },
      };

const REST_DEG = 12; // toast resting tilt; the RAF oscillates ±2° around this

/**
 * Single shared-state RAF for the whole toast subtree + floating stickers
 * (spec §2.1 / §3.4). Each element below has exactly one transform writer:
 * this loop. No Framer Motion or CSS animation touches these transforms.
 */
export default function ToastArt() {
  const reduced = useReducedMotion();
  const ready = useMotionReady();
  const fine = usePointerFine();

  const wrapRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const rockyRef = useRef<HTMLDivElement>(null);
  const stickerRef = useRef<HTMLImageElement>(null);

  // Per-frame state lives in refs — never useState (no re-render).
  const pointer = useRef({ x: 0, y: 0 });
  const center = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const lerp = useRef({ nx: 0, ny: 0 });
  const raf = useRef(0);

  useEffect(() => {
    // Reduced motion → no continuous loop. CSS base transforms hold the rest poses.
    if (reduced) return;

    const measure = () => {
      const r = wrapRef.current?.getBoundingClientRect();
      if (r) center.current = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
    };
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      measure();
    };
    measure();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);

    const start = performance.now();
    const frame = (now: number) => {
      const t = now - start;

      // ---- time-based idle motion ----
      const floatY = Math.sin(t * 0.0011) * 10; // ±10px, ~5.7s
      const baseRot = Math.sin(t * 0.0008) * 2; // ±2°
      const breathe = 1 + Math.sin(t * 0.0013) * 0.012; // ±1.2%

      // ---- pointer target (fine pointers only) ----
      let tnx = 0;
      let tny = 0;
      if (fine) {
        const c = center.current;
        tnx = Math.max(-1, Math.min(1, (pointer.current.x - c.x) / (c.w * 0.9)));
        tny = Math.max(-1, Math.min(1, (pointer.current.y - c.y) / (c.h * 0.9)));
      }
      lerp.current.nx += (tnx - lerp.current.nx) * 0.08;
      lerp.current.ny += (tny - lerp.current.ny) * 0.08;
      const nx = lerp.current.nx;
      const ny = lerp.current.ny;

      const tiltX = -ny * 6;
      const tiltY = nx * 6;

      // ---- write once per frame, one element per transform ----
      if (floatRef.current)
        floatRef.current.style.transform = `translate3d(0, ${floatY}px, 0) rotate(${REST_DEG + baseRot}deg)`;
      if (tiltRef.current)
        tiltRef.current.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate(${nx * 6}px, ${ny * 6}px)`;
      if (imgRef.current) imgRef.current.style.transform = `scale(${breathe})`;

      // ---- floating stickers: float + parallax (depths) + spin ----
      const floatB = Math.sin(t * 0.0014 + 1.1) * 9;
      const floatR = Math.sin(t * 0.00114 + 2.3) * 11;
      const floatS = Math.sin(t * 0.0012 + 0.6) * 8;
      const spin = (t * 0.0138) % 360;
      if (badgeRef.current)
        badgeRef.current.style.transform = `translate3d(${nx * 18}px, ${floatB + ny * 18}px, 0) rotate(12deg)`;
      if (rockyRef.current)
        rockyRef.current.style.transform = `translate3d(${nx * 9}px, ${floatR + ny * 9}px, 0)`;
      if (stickerRef.current)
        stickerRef.current.style.transform = `translate3d(${nx * 15}px, ${floatS + ny * 15}px, 0) rotate(${spin}deg)`;

      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [reduced, fine]);

  return (
    <div className="hero__art">
      <motion.div
        className="hero__toast-wrap"
        ref={wrapRef}
        variants={toastVar(reduced)}
        initial="hidden"
        animate={ready ? "visible" : "hidden"}
      >
        <div className="toast-float" ref={floatRef}>
          <div className="toast-tilt" ref={tiltRef}>
            <img
              className="hero__toast"
              ref={imgRef}
              src="/assets/hero-toast.png"
              alt="A slice of toast piled with chocolate spread, fresh raspberries and strawberries — Candi's signature treat."
            />
          </div>
        </div>
      </motion.div>

      <span className="hero__badge" ref={badgeRef} aria-hidden="true">
        <img className="hero__badge-bg" src="/assets/badge-candilicious.svg" alt="" />
        <span className="hero__badge-text">CANDilicious</span>
      </span>

      <div className="hero__rocky" ref={rockyRef} aria-hidden="true">
        <img src="/assets/rocky-flower.svg" alt="" />
        <span className="hero__rocky-label">Rocky</span>
      </div>

      <img
        className="hero__sticker"
        ref={stickerRef}
        src="/assets/playground-sticker.svg"
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
