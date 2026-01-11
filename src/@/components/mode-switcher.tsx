"use client";

import { useTheme } from "next-themes";
import * as React from "react";
import { Kbd } from "~/@/components/ui/kbd";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "~/@/components/ui/tooltip";

export function ModeSwitcher() {
	const { setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	const toggleTheme = React.useCallback(() => {
		if (!mounted) return;
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}, [mounted, resolvedTheme, setTheme]);

	React.useEffect(() => {
		if (!mounted) return;

		const down = (e: KeyboardEvent) => {
			if ((e.key === "d" || e.key === "D") && !e.metaKey && !e.ctrlKey) {
				if (
					(e.target instanceof HTMLElement && e.target.isContentEditable) ||
					e.target instanceof HTMLInputElement ||
					e.target instanceof HTMLTextAreaElement ||
					e.target instanceof HTMLSelectElement
				) {
					return;
				}

				e.preventDefault();
				toggleTheme();
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, [mounted, toggleTheme]);

	if (!mounted) {
		return null;
	}

	return (
		<Tooltip>
			<TooltipTrigger onClick={toggleTheme}>
				<div className="group/toggle flex size-8 items-center justify-center">
					<svg
						aria-hidden="true"
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
