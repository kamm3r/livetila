<script lang="ts">
  import ModeSwitcher from "./mode-switcher.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { ArrowUpRight } from "@lucide/svelte";
</script>

<header
  class="flex items-center justify-between px-4 pt-3 pb-2 sm:px-8 sm:pt-4 sm:pb-4"
>
  <Tooltip.Provider>
    <a
      href="/"
      class="relative whitespace-nowrap font-bold text-xl sm:text-2xl"
    >
      Livetila
      <sup
        class="absolute top-0 left-[calc(100%+.25rem)] font-extrabold text-muted-foreground text-[10px] sm:text-xs"
        >[BETA]</sup
      >
    </a>
    <div class="flex items-center gap-2 sm:gap-4">
      <a
        href="https://sfim-counter.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex min-h-8 items-center gap-1 rounded-sm text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 sm:text-sm"
      >
        SFIM-pisteet<span class="hidden sm:inline"> ja tulokset</span>
        <ArrowUpRight size={14} aria-hidden="true" />
        <span class="sr-only">(avautuu uuteen välilehteen)</span>
      </a>
      <ModeSwitcher />
    </div>
  </Tooltip.Provider>
</header>
