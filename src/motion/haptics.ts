/**
 * Optional, feature-detected haptics (spec §0 / decision #3). Satisfies the
 * "sound-ready interaction hooks" without a new dependency by using the native
 * Vibration API. Always feature-detected, gated behind prefers-reduced-motion,
 * and fired only on press/submit. Never blocks; a no-op where unsupported
 * (most desktops). Safe to call from any event handler.
 */
type HapticPreset = "nudge" | "press" | "success";

const PATTERNS: Record<HapticPreset, number | number[]> = {
  nudge: 10,
  press: 8,
  success: [12, 40, 14],
};

function isSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"
  );
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fire a haptic preset. No-op when unsupported or reduced-motion is on. */
export function trigger(preset: HapticPreset): void {
  if (!isSupported() || prefersReducedMotion()) return;
  try {
    navigator.vibrate(PATTERNS[preset]);
  } catch {
    /* never throw from a haptic */
  }
}
