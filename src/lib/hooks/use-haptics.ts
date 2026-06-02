export type HapticFeedback =
	| "success"
	| "warning"
	| "error"
	| "light"
	| "medium"
	| "heavy"
	| "selection";

let webHaptics: { trigger: (type: string) => void } | null = null;

async function initHaptics() {
	try {
		const mod = await import("web-haptics");
		webHaptics = mod.createHaptics?.() ?? null;
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
