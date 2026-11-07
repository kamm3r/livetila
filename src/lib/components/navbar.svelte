<script lang="ts">
  import ModeSwitcher from "./mode-switcher.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import { ArrowUpRight } from "@lucide/svelte";
</script>

<header class="border-b border-border/70">
  <div class="page-width flex h-14 items-center justify-between gap-4">
    <Tooltip.Provider>
      <a
        href="/"
        class="inline-flex items-center gap-2 rounded-sm whitespace-nowrap font-semibold text-lg tracking-tight focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
      >
        Livetila
        <span
          class="rounded-sm bg-muted px-1 py-px font-medium text-[10px] text-muted-foreground tracking-wide"
          >BETA</span
        >
      </a>
      <div class="flex items-center gap-2 sm:gap-3">
        <a
          href="https://sfim-counter.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex min-h-8 items-center gap-1 rounded-sm text-[13px] text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
        >
          SFIM-pisteet<span class="hidden sm:inline"> ja tulokset</span>
          <ArrowUpRight size={14} aria-hidden="true" />
          <span class="sr-only">(avautuu uuteen välilehteen)</span>
        </a>
        <ModeSwitcher class="-mr-[7px]" />
      </div>
    </Tooltip.Provider>
  </div>
</header>
