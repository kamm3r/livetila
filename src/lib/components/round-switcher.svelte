<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { getRoundContext } from "./round-provider.svelte";

  const ctx = getRoundContext();
</script>

{#if ctx.rounds.length > 1}
  <div class="flex flex-wrap items-center gap-2">
    {#each ctx.rounds as round (round.Index)}
      <Button
        size="sm"
        variant={ctx.selectedRound === round.Index ? "default" : "outline"}
        onclick={() => ctx.handleRoundChange(round.Index)}
      >
        {round.RoundTypeCategory === "Qualify"
          ? "Alkuerät"
          : round.RoundTypeCategory === "Final"
            ? "Loppukilpailu"
            : round.Name}
      </Button>
    {/each}
  </div>
{/if}
