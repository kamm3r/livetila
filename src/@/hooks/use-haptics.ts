"use client";

import { useCallback } from "react";

export type HapticFeedback =
	| "success"
	| "warning"
	| "error"
	| "light"
	| "medium"
	| "heavy"
	| "selection";

// Vibration patterns in milliseconds for each feedback type
const HAPTIC_PATTERNS: Record<HapticFeedback, number | number[]> = {
	light: 10,
	medium: 25,
	heavy: 50,
	selection: 15,
	success: [10, 50, 30],
	warning: [30, 50, 30],
	error: [50, 100, 50, 100, 50],
};

function triggerHaptic(type: HapticFeedback): void {
	if (typeof window === "undefined") return;
	if (!("vibrate" in navigator)) return;

	const pattern = HAPTIC_PATTERNS[type];
	navigator.vibrate(pattern);
}

export function useHaptics() {
	const feedback = useCallback((type: HapticFeedback) => {
		triggerHaptic(type);
	}, []);

	return { feedback };
}
