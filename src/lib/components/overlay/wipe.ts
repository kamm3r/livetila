import { cubicInOut } from "svelte/easing";
import { prefersReducedMotion } from "svelte/motion";
import type { TransitionConfig } from "svelte/transition";

// Record banners wipe across the row like a TV graphic, leaving the mark in
// view. In, the curve is fitted to broadcast footage: a quick start, most of
// the way across by half time, then a long soft finish.
const duration = 300;

// cubic-bezier(0.4, 0.15, 0.4, 1), solved for x by bisection.
function easing(x: number) {
  const [x1, y1, x2, y2] = [0.4, 0.15, 0.4, 1];
  const at = (t: number, a: number, b: number) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    if (at(mid, x1, x2) < x) lo = mid;
    else hi = mid;
  }
  return at((lo + hi) / 2, y1, y2);
}

export function wipeIn(_node: HTMLElement): TransitionConfig {
  return {
    duration: prefersReducedMotion.current ? 0 : duration,
    easing,
    css: (_t, u) => `clip-path: inset(0 ${u * 100}% 0 0)`,
  };
}

// Out, the returning row pushes in from the left: its edge crosses the whole
// banner while the banner's content slides right at under half the speed and
// off the end of the row.
export function wipeOut(_node: HTMLElement): TransitionConfig {
  return {
    duration: prefersReducedMotion.current ? 0 : 350,
    easing: cubicInOut,
    css: (_t, u) =>
      `transform: translateX(${u * 40}%); clip-path: inset(0 0 0 ${u * 60}%)`,
  };
}

// The label settles a little to the right as it is uncovered.
export function settle(_node: HTMLElement): TransitionConfig {
  return {
    duration: prefersReducedMotion.current ? 0 : duration,
    easing,
    css: (_t, u) => `transform: translateX(${u * -8}px)`,
  };
}
