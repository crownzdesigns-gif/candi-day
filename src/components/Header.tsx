import { useEffect, useRef, useState } from "react";
import { motion, type Variants } from "motion/react";
import { useReducedMotion } from "../motion/useReducedMotion";
import { useMotionReady } from "../motion/ready";
import { spring } from "../motion/tokens";
import { trigger } from "../motion/haptics";
import "./Header.css";

const NAV_LINKS = [
  { label: "Find the cart", href: "#cart" },
  { label: "Candy club", href: "#club" },
  { label: "Book an event", href: "#events" },
  { label: "Buy candy", href: "#shop" },
];

/** Nav container: slide down on mount, then cascade the menu items (spec §3.2). */
function navVariants(reduced: boolean): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } };
  }
  return { hidden: { y: "-100%" }, visible: { y: 0, transition: spring.pillowy } };
}

function listVariants(reduced: boolean): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: reduced ? 0 : 0.05, delayChildren: reduced ? 0 : 0.18 },
    },
  };
}

function itemVariants(reduced: boolean): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } };
  }
  return {
    hidden: { y: -12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: spring.bouncy },
  };
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();
  const ready = useMotionReady();

  const navRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: close on Escape, on outside tap, and when the viewport grows
  // back to the desktop nav (so state never gets stuck open behind the inline nav).
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    trigger("nudge");
    setMenuOpen((o) => !o);
  };
  const closeMenu = () => setMenuOpen(false);

  // Easter egg: 5 logo clicks within a 1.5s rolling window → candy rain (§3.13)
  const clicks = useRef<number[]>([]);
  const onLogoClick = () => {
    const now = Date.now();
    clicks.current = [...clicks.current, now].filter((t) => now - t < 1500);
    if (clicks.current.length >= 5) {
      clicks.current = [];
      window.dispatchEvent(new CustomEvent("candy-rain"));
    }
  };

  return (
    <header className="header">
      {/* Marquee announcement */}
      <div className="announce">
        <div className="announce__track" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>
              Candy club is getting booked until July! Join the project waitlist →
            </span>
          ))}
        </div>
        <span className="visually-hidden">
          Candy club is getting booked until July. Join the project waitlist.
        </span>
      </div>

      {/* Nav */}
      <motion.nav
        ref={navRef}
        className={`nav${scrolled ? " nav--scrolled" : ""}${menuOpen ? " nav--menu-open" : ""}`}
        aria-label="Primary"
        variants={navVariants(reduced)}
        initial="hidden"
        animate={ready ? "visible" : "hidden"}
      >
        <a href="#top" className="nav__logo" aria-label="CANDi — home" onClick={onLogoClick}>
          CANDi
        </a>

        <button
          ref={menuBtnRef}
          type="button"
          className="nav__menu-btn"
          aria-expanded={menuOpen}
          aria-controls="primary-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={toggleMenu}
        >
          <span className={`nav__burger${menuOpen ? " is-open" : ""}`} aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="nav__menu-label">{menuOpen ? "Close" : "Menu"}</span>
        </button>

        <div id="primary-menu" className={`nav__menu${menuOpen ? " is-open" : ""}`}>
          <motion.ul className="nav__links" variants={listVariants(reduced)}>
            {NAV_LINKS.map((link) => (
              <motion.li key={link.label} variants={itemVariants(reduced)}>
                <motion.a
                  href={link.href}
                  className="nav__link"
                  onClick={closeMenu}
                  whileHover={reduced ? undefined : { rotate: [0, -2, 2, 0], transition: { duration: 0.3 } }}
                >
                  <span>{link.label}</span>
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>

          <a
            href="#club"
            className="btn btn--lilac nav__cta"
            onClick={closeMenu}
            onPointerDown={() => trigger("nudge")}
          >
            <span>Join for free</span>
            <span className="btn__arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </motion.nav>
    </header>
  );
}
