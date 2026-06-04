import { get, writable } from "svelte/store";

export type Theme = "light" | "dark";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark";
}

function createThemeStore() {
  const stored =
    typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial: Theme = isTheme(stored)
    ? stored
    : prefersDark
      ? "dark"
      : "light";

  if (initial === "dark") {
    document.documentElement.classList.add("dark");
  }

  const { subscribe, set } = writable<Theme>(initial);

  function applyTheme(theme: Theme) {
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
      const current = get({ subscribe });
      const next: Theme = current === "dark" ? "light" : "dark";
      applyTheme(next);
      set(next);
    },
    setTheme(theme: Theme) {
      applyTheme(theme);
      set(theme);
    },
  };
}

export const theme = createThemeStore();
