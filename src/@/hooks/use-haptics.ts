"use client";

import { trigger } from "web-haptics";
import { useCallback } from "react";

export type HapticFeedback = "success" | "warning" | "error" | "light" | "medium" | "heavy" | "selection";

export function useHaptics() {
	const feedback = useCallback((type: HapticFeedback) => {
		try {
			trigger(type);
		} catch (error) {
			// Silently fail on unsupported devices
			console.debug("[v0] Haptics not supported");
		}
	}, []);

	return { feedback };
}
