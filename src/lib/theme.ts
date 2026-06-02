import { writable } from "svelte/store";

function createThemeStore() {
	const stored = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
	const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
	const initial = stored ?? (prefersDark ? "dark" : "light");

	if (initial === "dark") {
		document.documentElement.classList.add("dark");
	}

	const { subscribe, set } = writable<string>(initial);

	function applyTheme(theme: string) {
		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
		localStorage.setItem("theme", theme);
	}

	return {
		subscribe,
		toggle() {
			let current: string;
			const unsub = subscribe((val) => { current = val; });
			unsub();
			const next = current === "dark" ? "light" : "dark";
			applyTheme(next);
			set(next);
		},
		setTheme(theme: string) {
			applyTheme(theme);
			set(theme);
		},
	};
}

export const theme = createThemeStore();
