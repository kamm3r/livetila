<script lang="ts">
	import "../app.css";
	import { theme } from "$lib/theme";
	import { onMount } from "svelte";

	onMount(() => {
		const stored = localStorage.getItem("theme");
		if (stored) {
			theme.setTheme(stored);
		}
	});
</script>

<svelte:head>
	<title>Livetila</title>
	<meta name="description" content="live.tuloslista API, live result overlay for Live streams" />
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<slot />
