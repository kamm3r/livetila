<script lang="ts">
	import { InfoIcon } from "@lucide/svelte";
	import { page } from "$app/stores";
	import Embed from "./embed.svelte";
	import { triggerHaptic } from "$lib/hooks/use-haptics";

	let { slug }: { slug: string } = $props();

	let open = $state(false);
	let origin = $state("");

	$effect(() => {
		origin = window.location.origin;
	});

	function toggle() {
		triggerHaptic("selection");
		open = !open;
	}
</script>

<div class="relative">
	<button
		class="inline-flex h-8 shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded border border-border bg-background bg-clip-padding px-2.5 font-medium text-sm shadow-xs outline-none hover:border-primary/50 hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
		onclick={toggle}
	>
		<InfoIcon class="size-4" />
		<span class="sr-only sm:not-sr-only">OBS Overlay</span>
	</button>

	{#if open}
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-40" onclick={() => open = false} onkeydown={() => open = false} role="presentation"></div>
		<div class="absolute right-0 z-50 mt-2 w-full max-w-96 origin-top-right rounded-lg border bg-popover p-4 text-popover-foreground shadow-md">
			<div class="space-y-1.5">
				<h3 class="font-semibold leading-none tracking-tight">OBS Overlay</h3>
				<p class="text-muted-foreground text-sm">jos haluut näyttää vain tietyn erän tulokset niin tee näin</p>
			</div>
			<div class="mt-4 flex flex-col gap-4">
				<div class="space-y-2">
					<div class="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm">
						{origin}/obs/{slug}<br />
						<span class="rounded bg-primary/20 px-1 py-0.5 text-primary">?round=1&heat=1</span>
					</div>
					<div class="text-muted-foreground text-xs">
						Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen mukaan.
					</div>
				</div>
				<Embed {slug} />
			</div>
		</div>
	{/if}
</div>
