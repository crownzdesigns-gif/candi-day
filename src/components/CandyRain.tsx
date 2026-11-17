import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../motion/useReducedMotion";
import "./CandyRain.css";

const COUNT = 40;
const CANDIES = ["🍬", "🍭", "🍫", "🍩", "🧁", "🍪"];
const GRAVITY = 0.0022; // px / ms²
const RESTITUTION = 0.7;
const RADIUS = 18;
const RAIN_MS = 4000; // active physics
const FADE_MS = 600; // fade-out

type Body = { x: number; y: number; vx: number; vy: number; rot: number; vrot: number };

/** Easter egg: 5 logo clicks in 1.5s dispatch `candy-rain` (spec §3.13). */
export default function CandyRain() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(false);

  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const bodies = useRef<Body[]>([]);
  const raf = useRef(0);

  // Listen for the trigger; ignored under reduced motion or while already raining.
  useEffect(() => {
    const onTrigger = () => {
      if (reduced) return;
      setActive((cur) => cur || true);
    };
    window.addEventListener("candy-rain", onTrigger);
    return () => window.removeEventListener("candy-rain", onTrigger);
  }, [reduced]);

  useEffect(() => {
    if (!active) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    bodies.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: -Math.random() * H * 0.6 - 20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 0.15 + 0.05,
      rot: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 0.6,
    }));
    // seed the emoji glyphs once
    spans.current.forEach((el, i) => {
      if (el) el.textContent = CANDIES[i % CANDIES.length];
    });

    let prev = performance.now();
    const start = prev;

    const frame = (now: number) => {
      const dt = Math.min(48, now - prev);
      prev = now;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const elapsed = now - start;
      const alpha = elapsed > RAIN_MS ? Math.max(0, 1 - (elapsed - RAIN_MS) / FADE_MS) : 1;

      for (let i = 0; i < COUNT; i++) {
        const b = bodies.current[i];
        b.vy += GRAVITY * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.vrot * dt;

        if (b.x < RADIUS) {
          b.x = RADIUS;
          b.vx = -b.vx * RESTITUTION;
        } else if (b.x > vw - RADIUS) {
          b.x = vw - RADIUS;
          b.vx = -b.vx * RESTITUTION;
        }
        if (b.y > vh - RADIUS) {
          b.y = vh - RADIUS;
          b.vy = -b.vy * RESTITUTION;
          b.vx *= 0.985;
        } else if (b.y < RADIUS && b.vy < 0) {
          b.y = RADIUS;
          b.vy = -b.vy * RESTITUTION;
        }

        const el = spans.current[i];
        if (el) {
          el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rot}deg)`;
          el.style.opacity = String(alpha);
        }
      }

      if (elapsed > RAIN_MS + FADE_MS) {
        cancelAnimationFrame(raf.current);
        setActive(false);
        return;
      }
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  if (!active) return null;

  return (
    <div className="candy-rain" aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            spans.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
