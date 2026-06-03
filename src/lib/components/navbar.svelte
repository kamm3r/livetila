<script lang="ts">
	import ModeSwitcher from "./mode-switcher.svelte";
	import * as Tooltip from "$lib/components/ui/tooltip/index.js";
</script>

<header class="flex items-center justify-between px-4 pt-3 pb-2 sm:px-8 sm:pt-4 sm:pb-4">
	<Tooltip.Provider>
		<a href="/" class="relative whitespace-nowrap font-bold text-xl sm:text-2xl">
			Livetila
			<sup class="absolute top-0 left-[calc(100%+.25rem)] font-extrabold text-muted-foreground text-[10px] sm:text-xs">[BETA]</sup>
		</a>
		<ModeSwitcher />
	</Tooltip.Provider>
</header>
