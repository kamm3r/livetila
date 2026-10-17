<script lang="ts">
  // The original overlay, tightened: rank column, slimmer six-slot attempt
  // strip, PB/SB tags and a flash when a result changes.
  import { flip } from "svelte/animate";
  import { prefersReducedMotion } from "svelte/motion";
  import { cn } from "$lib/utils";
  import { isTimed, recordTag } from "$lib/results";
  import AthleteBadge from "$lib/components/athlete-badge.svelte";
  import {
    attemptSlots,
    isFoul,
    qualification,
    rankOf,
    type OverlayView,
  } from "./overlay";

  let { view, inHeat }: { view: OverlayView; inHeat: boolean } = $props();

  const timed = $derived(isTimed(view.eventCategory));
  const duration = $derived(prefersReducedMotion.current ? 0 : 250);
</script>

<div class="max-w-xs text-gray-50">
  <div class="w-80 border-cyan-300 border-t-2 bg-black/90">
    <div class="flex items-baseline justify-between px-2">
      <h2 class="text-cyan-300 uppercase">{view.roundName ?? ""}</h2>
      {#if view.wind}
        <span class="text-gray-400 text-xs tabular-nums">{view.wind} m/s</span>
      {/if}
    </div>
    <div class="flex justify-between">
      <h3 class="bg-cyan-300 px-2 text-black uppercase">
        {view.eventName ?? ""}{view.heatLabel ? ` · ${view.heatLabel}` : ""}
      </h3>
      <h4 class="px-2 uppercase">Tulos</h4>
    </div>

    {#if view.isRefreshError}
      <p role="status" class="px-2 text-cyan-300 text-xs">Päivitys viivästyy</p>
    {/if}

    <ol class="mt-1">
      {#each view.entries as entry, index (entry.Id)}
        {@const change = view.changes.get(entry.Id)}
        {@const rank = rankOf(entry, index, inHeat)}
        {@const tag = recordTag(entry, view.eventCategory)}
        {@const q = qualification(entry)}
        <li
          animate:flip={{ duration }}
          class={cn(
            "border-black/50 border-t-2 transition-colors duration-700",
            change && "bg-cyan-300/25 duration-0",
          )}
        >
          <div class="flex items-center gap-2 py-1 pr-2">
            <span
              class={cn(
                "w-7 shrink-0 text-center tabular-nums",
                rank === 1 ? "font-bold text-cyan-300" : "text-gray-400",
              )}
            >
              {rank ?? ""}
            </span>
            <span class="flex w-6 shrink-0 justify-center"
              ><AthleteBadge {entry} /></span
            >
            <span class="min-w-0 flex-1 truncate">{entry.Name}</span>
            {#if tag}
              <span
                class={cn(
                  "px-1 font-bold text-[10px]",
                  tag === "PB"
                    ? "bg-cyan-300 text-black"
                    : "border border-cyan-300 text-cyan-300",
                )}
              >
                {tag}
              </span>
            {/if}
            {#if q}<span class="text-cyan-300 text-xs">{q}</span>{/if}
            <span class="shrink-0 tabular-nums">{entry.Result}</span>
          </div>

          {#if !timed && entry.Attempts}
            <ol
              class="ml-7 grid grid-cols-6 bg-gray-300 text-black text-sm tabular-nums"
            >
              {#each attemptSlots(entry.Attempts) as attempt, i (i)}
                <li
                  class={cn(
                    "py-0.5 text-center even:bg-gray-200",
                    isFoul(attempt.Line1) && "text-gray-500",
                    !attempt.Line1 && "bg-gray-400/60! even:bg-gray-400/50!",
                    attempt.Line1 &&
                      attempt.Line1 === entry.Result &&
                      "bg-cyan-300! font-semibold",
                    change?.newAttempt === i && "animate-pulse",
                  )}
                >
                  {attempt.Line1 || " "}
                </li>
              {/each}
            </ol>
          {/if}
        </li>
      {/each}
    </ol>
  </div>

  <h1 class="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">
    {view.competitionName ?? ""}
  </h1>
</div>
