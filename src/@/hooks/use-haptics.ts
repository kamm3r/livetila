"use client";

import { useWebHaptics } from "web-haptics/react";

export type HapticFeedback =
	| "success"
	| "warning"
	| "error"
	| "light"
	| "medium"
	| "heavy"
	| "selection";

export function useHaptics() {
	const { trigger } = useWebHaptics();

	const feedback = (type: HapticFeedback) => {
		try {
			trigger(type);
		} catch {
			// Silently fail on unsupported devices
		}
	};

	return { feedback };
}
