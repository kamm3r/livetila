<script lang="ts">
	import { CheckIcon, CopyIcon } from "@lucide/svelte";
	import { page } from "$app/stores";

	let { slug }: { slug: string } = $props();

	let copy = $state(false);

	function copyUrlToClipboard() {
		const round = $page.url.searchParams.get("round");
		const url = `${window.location.origin}/obs/${slug}?${!round ? "" : "round=1&"}${round === "Final" ? "" : "heat=1"}`;
		navigator.clipboard.writeText(url);
		copy = true;
		setTimeout(() => { copy = false; }, 1500);
	}
</script>

<button
	class="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
	onclick={copyUrlToClipboard}
>
	<div class="relative flex size-4 items-center justify-center">
		{#if copy}
			<CheckIcon class="size-4" />
		{:else}
			<CopyIcon class="size-4" />
		{/if}
	</div>
	<span class="sr-only text-sm sm:not-sr-only">{copy ? "Kopioitu!" : "Kopioi linkki"}</span>
</button>
