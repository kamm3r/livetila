<script lang="ts">
	import "../app.css";
	import { theme, type Theme } from "$lib/theme";
	import { onMount } from "svelte";

	onMount(() => {
		const stored = localStorage.getItem("theme");
		if (stored === "light" || stored === "dark") {
			theme.setTheme(stored satisfies Theme);
		}
	});
</script>

<svelte:head>
	<title>Livetila</title>
	<meta name="description" content="live.tuloslista API, live result overlay for Live streams" />
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<slot />
