<script lang="ts">
  // The original overlay with one athlete expanded: whoever just competed
  // shows their full series, everyone else collapses to a single line. A
  // footer names who is up next when the starting order allows inferring it.
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { cn } from "$lib/utils";
  import {
    gapToLeader,
    isTimed,
    leadingResult,
    recordTag,
    turnOrder,
  } from "$lib/results";
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
  const leader = $derived(leadingResult(view.entries, view.eventCategory));
  const duration = $derived(prefersReducedMotion.current ? 0 : 250);
  const turn = $derived(timed ? null : turnOrder(view.entries));
  // The latest attempt seen while on air, else the last athlete in the
  // starting order to have thrown, else the leader.
  const focusId = $derived(
    view.changes.latest?.id ?? turn?.previous?.Id ?? view.entries[0]?.Id,
  );
</script>

<div class="max-w-xs text-gray-50">
  <div class="w-80 border-cyan-300 border-t-2 bg-black/90">
    <h2 class="px-2 text-cyan-300 uppercase">
      {view.roundName ?? ""}{view.heatLabel ? ` · ${view.heatLabel}` : ""}
    </h2>
    <div class="flex justify-between">
      <h3 class="bg-cyan-300 px-2 text-black uppercase">
        {view.eventName ?? ""}
      </h3>
      <h4 class="px-2 uppercase">
        {#if view.wind}<span class="mr-2 text-gray-400 text-xs normal-case"
            >{view.wind} m/s</span
          >{/if}Tulos
      </h4>
    </div>

    <ol class="mt-1">
      {#each view.entries as entry, index (entry.Id)}
        {@const change = view.changes.get(entry.Id)}
        {@const rank = rankOf(entry, index, inHeat)}
        {@const focused = !timed && entry.Id === focusId}
        {@const tag = recordTag(entry, view.eventCategory)}
        {@const gap = gapToLeader(entry.Result, leader, view.eventCategory)}
        {@const q = qualification(entry)}
        <li
          animate:flip={{ duration }}
          class={cn(
            "border-black/50 border-t-2 transition-colors duration-700",
            focused && "bg-white/10",
            change && "bg-cyan-300/25 duration-0",
          )}
        >
          <div
            class={cn(
              "flex items-center gap-2 pr-2",
              focused ? "py-1.5" : "py-0.5",
            )}
          >
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
            <span
              class={cn("min-w-0 flex-1 truncate", focused && "font-semibold")}
            >
              {entry.Name}
            </span>
            {#if tag}
              <span class="bg-cyan-300 px-1 font-bold text-[10px] text-black"
                >{tag}</span
              >
            {/if}
            {#if q}<span class="text-cyan-300 text-xs">{q}</span>{/if}
            {#if !focused && gap && gap !== "—"}
              <span class="text-gray-500 text-xs tabular-nums">{gap}</span>
            {/if}
            <span
              class={cn(
                "shrink-0 tabular-nums",
                focused && "text-lg font-bold",
              )}
            >
              {entry.Result}
            </span>
          </div>

          {#if focused}
            <ol
              transition:slide={{ duration }}
              class="ml-7 grid grid-cols-6 bg-gray-300 text-black tabular-nums"
            >
              {#each attemptSlots(entry.Attempts) as attempt, i (i)}
                <li
                  class={cn(
                    "flex flex-col items-center py-1.5 even:bg-gray-200",
                    isFoul(attempt.Line1) && "text-gray-500",
                    !attempt.Line1 && "bg-gray-400/60! even:bg-gray-400/50!",
                    attempt.Line1 &&
                      attempt.Line1 === entry.Result &&
                      "bg-cyan-300! font-semibold",
                    change?.newAttempt === i && "animate-pulse",
                  )}
                >
                  <span>{attempt.Line1 || " "}</span>
                  {#if attempt.Line2}<span class="text-xs">{attempt.Line2}</span
                    >{/if}
                </li>
              {/each}
            </ol>
          {/if}
        </li>
      {/each}
    </ol>

    {#if turn?.next}
      <div
        class="flex items-center gap-2 border-cyan-300 border-t px-2 py-1 text-sm"
      >
        <span class="text-cyan-300 text-xs uppercase">Vuorossa</span>
        <AthleteBadge entry={turn.next} />
        <span class="truncate">{turn.next.Name}</span>
      </div>
    {/if}
    {#if view.isRefreshError}
      <p role="status" class="px-2 text-cyan-300 text-xs">Päivitys viivästyy</p>
    {/if}
  </div>

  <h1 class="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">
    {view.competitionName ?? ""}
  </h1>
</div>
