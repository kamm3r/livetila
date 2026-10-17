<script lang="ts">
  import { cn } from "$lib/utils";
  import { getRoundContext } from "./round-provider.svelte";

  const ctx = getRoundContext();

  function label(category: string, name: string) {
    if (category === "Qualify") return { full: "Alkuerät", short: "Alku" };
    if (category === "Final") return { full: "Loppukilpailu", short: "Loppu" };
    return { full: name, short: name };
  }
</script>

{#if ctx.rounds.length > 1}
  <div class="inline-flex items-center rounded-full bg-muted p-[3px]">
    {#each ctx.rounds as round (round.Index)}
      {@const text = label(round.RoundTypeCategory, round.Name)}
      {@const selected = ctx.selectedRound === round.Index}
      <button
        type="button"
        aria-pressed={selected}
        class={cn(
          "motion-control h-7 rounded-full px-3.5 font-medium text-xs focus-visible:outline-2 focus-visible:outline-primary",
          selected
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        onclick={() => ctx.handleRoundChange(round.Index)}
      >
        <span class="sm:hidden" aria-hidden="true">{text.short}</span>
        <span class="sr-only sm:not-sr-only">{text.full}</span>
      </button>
    {/each}
  </div>
{/if}
