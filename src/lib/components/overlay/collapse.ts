import { cubicInOut } from "svelte/easing";
import { prefersReducedMotion } from "svelte/motion";
import { slide, type TransitionConfig } from "svelte/transition";

// Attempt details fold away instead of popping: the contents fade out in the
// first half while the space closes. Opening runs the same motion in reverse.
export function collapse(node: HTMLElement): TransitionConfig {
  const base = slide(node, {
    duration: prefersReducedMotion.current ? 0 : 400,
    easing: cubicInOut,
  });
  const opacity = +getComputedStyle(node).opacity;
  return {
    ...base,
    css: (t, u) =>
      `${base.css?.(t, u)};opacity: ${Math.max(0, t * 2 - 1) * opacity};`,
  };
}
