import { onMount } from "svelte";

export function useKeyboardShortcut(key: string, callback: () => void) {
	onMount(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === key && !event.repeat) {
				callback();
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	});
}
