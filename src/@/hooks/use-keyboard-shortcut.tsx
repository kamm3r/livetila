"use client";

import { useEffect, useRef } from "react";

/**
 * Registers a keyboard shortcut on the document.
 * The callback is stored in a ref so the listener doesn't re-register
 * when the callback identity changes (client-event-listeners).
 */
export function useKeyboardShortcut(
	key: string,
	callback: () => void,
	enabled = true,
) {
	const callbackRef = useRef(callback);
	callbackRef.current = callback;

	useEffect(() => {
		if (!enabled) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.metaKey || e.ctrlKey) return;
			if (e.key.toLowerCase() !== key.toLowerCase()) return;

			const target = e.target;
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable ||
					target instanceof HTMLInputElement ||
					target instanceof HTMLTextAreaElement ||
					target instanceof HTMLSelectElement)
			) {
				return;
			}

			e.preventDefault();
			callbackRef.current();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [key, enabled]);
}
