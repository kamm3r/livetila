"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { Kbd } from "~/@/components/ui/kbd";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/@/components/ui/tooltip";

function useKeyboardShortcut(
	key: string,
	callback: () => void,
	enabled = true,
) {
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
			callback();
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [key, callback, enabled]);
}

export function ModeSwitcher() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = useCallback(() => {
		if (!mounted) return;
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}, [mounted, resolvedTheme, setTheme]);

	useKeyboardShortcut("d", toggleTheme, mounted);

	if (!mounted) {
		return null;
	}

	return (
		<Tooltip>
			<TooltipTrigger onClick={toggleTheme}>
				<div className="group/toggle flex size-8 items-center justify-center">
					<svg
						aria-hidden="true"
						aria-label="Toggle theme"
						className="size-4.5"
						fill="none"
						focusable="false"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M0 0h24v24H0z" stroke="none" />
						<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
						<path d="M12 3l0 18" />
						<path d="M12 9l4.65 -4.65" />
						<path d="M12 14.3l7.37 -7.37" />
						<path d="M12 19.6l8.85 -8.85" />
					</svg>
					<span className="sr-only">Toggle theme</span>
				</div>
			</TooltipTrigger>

			<TooltipContent className="flex items-center gap-2 pr-1">
				Toggle mode <Kbd>D</Kbd>
			</TooltipContent>
		</Tooltip>
	);
}
