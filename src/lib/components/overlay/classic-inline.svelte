<script lang="ts">
  // The original overlay as one line per athlete: the attempt strip moves in
  // beside the name, so a full final fits in half the height.
  import { flip } from "svelte/animate";
  import { prefersReducedMotion } from "svelte/motion";
  import { cn } from "$lib/utils";
  import { gapToLeader, isTimed, leadingResult } from "$lib/results";
  import AthleteBadge from "$lib/components/athlete-badge.svelte";
  import {
    attemptSlots,
    isFoul,
    qualification,
    rankOf,
    shortName,
    type OverlayView,
  } from "./overlay";

  let { view, inHeat }: { view: OverlayView; inHeat: boolean } = $props();

  const timed = $derived(isTimed(view.eventCategory));
  const leader = $derived(leadingResult(view.entries, view.eventCategory));
  const duration = $derived(prefersReducedMotion.current ? 0 : 250);
</script>

<div class="w-fit text-gray-50">
  <div class="border-cyan-300 border-t-2 bg-black/90">
    <div class="flex items-stretch justify-between">
      <div class="flex items-stretch">
        <h3 class="flex items-center bg-cyan-300 px-2 text-black uppercase">
          {view.eventName ?? ""}
        </h3>
        <h2 class="flex items-center px-2 text-cyan-300 uppercase">
          {view.roundName ?? ""}{view.heatLabel ? ` · ${view.heatLabel}` : ""}
        </h2>
      </div>
      <div class="flex items-center gap-3 px-2 text-xs uppercase">
        {#if view.wind}<span class="text-gray-400">{view.wind} m/s</span>{/if}
        {#if !timed}
          <span class="w-[13.5rem] text-center text-gray-400">Yritykset</span>
        {/if}
        <span class="w-14 text-right">Tulos</span>
      </div>
    </div>

    <ol>
      {#each view.entries as entry, index (entry.Id)}
        {@const change = view.changes.get(entry.Id)}
        {@const rank = rankOf(entry, index, inHeat)}
        {@const name = shortName(entry)}
        {@const gap = gapToLeader(entry.Result, leader, view.eventCategory)}
        {@const q = qualification(entry)}
        <li
          animate:flip={{ duration }}
          class={cn(
            "flex h-8 items-center gap-2 border-black/50 border-t-2 pr-2 transition-colors duration-700",
            change && "bg-cyan-300/25 duration-0",
          )}
        >
          <span
            class={cn(
              "flex h-full w-7 shrink-0 items-center justify-center tabular-nums",
              rank === 1 ? "bg-cyan-300 font-bold text-black" : "text-gray-400",
            )}
          >
            {rank ?? ""}
          </span>
          <span class="flex w-6 shrink-0 justify-center"
            ><AthleteBadge {entry} /></span
          >
          <span class="w-40 truncate">
            <span class="uppercase">{name.surname}</span>
            <span class="text-gray-400">{name.initial}</span>
          </span>
          <span class="w-4 text-cyan-300 text-xs">{q ?? ""}</span>

          {#if !timed}
            <ol
              class="grid h-full w-[13.5rem] grid-cols-6 bg-gray-300 text-black text-xs tabular-nums"
            >
              {#each attemptSlots(entry.Attempts) as attempt, i (i)}
                <li
                  class={cn(
                    "flex items-center justify-center even:bg-gray-200",
                    isFoul(attempt.Line1) && "text-gray-500",
                    !attempt.Line1 && "bg-gray-400/60! even:bg-gray-400/50!",
                    attempt.Line1 &&
                      attempt.Line1 === entry.Result &&
                      "bg-cyan-300! font-semibold",
                    change?.newAttempt === i && "animate-pulse",
                  )}
                >
                  {attempt.Line1 || ""}
                </li>
              {/each}
            </ol>
          {:else}
            <span class="w-14 text-right text-gray-400 text-xs tabular-nums">
              {gap && gap !== "—" ? gap : ""}
            </span>
          {/if}

          <span class="w-14 text-right font-semibold tabular-nums">
            {entry.Result}
          </span>
        </li>
      {/each}
    </ol>
  </div>

  <h1 class="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">
    {view.competitionName ?? ""}
    {#if view.isRefreshError}
      <span class="ml-2 text-gray-400 normal-case">· päivitys viivästyy</span>
    {/if}
  </h1>
</div>
