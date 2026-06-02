import { j as writable } from "./dev.js";
import "./index-server2.js";
//#region src/lib/theme.ts
function createThemeStore() {
	const stored = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
	const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
	const initial = stored ?? (prefersDark ? "dark" : "light");
	if (initial === "dark") document.documentElement.classList.add("dark");
	const { subscribe, set } = writable(initial);
	function applyTheme(theme) {
		if (theme === "dark") document.documentElement.classList.add("dark");
		else document.documentElement.classList.remove("dark");
		localStorage.setItem("theme", theme);
	}
	return {
		subscribe,
		toggle() {
			let current;
			subscribe((val) => {
				current = val;
			})();
			const next = current === "dark" ? "light" : "dark";
			applyTheme(next);
			set(next);
		},
		setTheme(theme) {
			applyTheme(theme);
			set(theme);
		}
	};
}
var theme = createThemeStore();
//#endregion
export { theme as t };
