export type HapticFeedback =
  | "success"
  | "warning"
  | "error"
  | "light"
  | "medium"
  | "heavy"
  | "selection";

type HapticsInstance = {
  trigger: (type: HapticFeedback) => void;
};

let webHaptics: HapticsInstance | null = null;

async function initHaptics() {
  try {
    const mod = await import("web-haptics/svelte");
    webHaptics = mod.createWebHaptics();
  } catch {
    // Silently fail on unsupported devices
  }
}

initHaptics();

export function triggerHaptic(type: HapticFeedback) {
  try {
    webHaptics?.trigger(type);
  } catch {
    // Silently fail
  }
}
