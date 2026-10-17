<script lang="ts">
  // Timing tower: a narrow, dense standings column for the side of the frame.
  import { flip } from "svelte/animate";
  import { prefersReducedMotion } from "svelte/motion";
  import { cn } from "$lib/utils";
  import { gapToLeader, isTimed, leadingResult, recordTag } from "$lib/results";
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

  const leader = $derived(leadingResult(view.entries, view.eventCategory));
  const timed = $derived(isTimed(view.eventCategory));
  const duration = $derived(prefersReducedMotion.current ? 0 : 300);
</script>

<div class="w-80 font-sans text-white">
  <header class="overflow-hidden rounded-t-md bg-neutral-950/95">
    <div class="flex items-center justify-between gap-2 px-3 pt-2">
      <span
        class="truncate text-[11px] text-neutral-400 uppercase tracking-wider"
      >
        {view.competitionName ?? ""}
      </span>
      <span class="flex shrink-0 items-center gap-1.5" aria-hidden="true">
        <span class="size-1.5 rounded-full bg-red-500 motion-safe:animate-pulse"
        ></span>
        <span class="font-bold text-[10px] text-red-400 tracking-[0.12em]"
          >LIVE</span
        >
      </span>
    </div>
    <h2 class="truncate px-3 font-extrabold text-lg uppercase leading-tight">
      {view.eventName ?? "…"}
    </h2>
    <div
      class="mt-1 flex items-center justify-between bg-cyan-300 px-3 py-0.5 font-semibold text-black text-xs uppercase"
    >
      <span class="truncate">
        {view.roundName ?? ""}{view.heatLabel ? ` · ${view.heatLabel}` : ""}
      </span>
      {#if view.wind}
        <span class="shrink-0 tabular-nums">Tuuli {view.wind}</span>
      {/if}
    </div>
  </header>

  {#if view.isRefreshError}
    <p role="status" class="bg-amber-400 px-3 py-0.5 text-black text-xs">
      Päivitys viivästyy
    </p>
  {/if}

  <ol class="overflow-hidden rounded-b-md bg-neutral-900/95">
    {#each view.entries as entry, index (entry.Id)}
      {@const change = view.changes.get(entry.Id)}
      {@const rank = rankOf(entry, index, inHeat)}
      {@const name = shortName(entry)}
      {@const tag = recordTag(entry, view.eventCategory)}
      {@const gap = gapToLeader(entry.Result, leader, view.eventCategory)}
      {@const q = qualification(entry)}
      <li
        animate:flip={{ duration }}
        class={cn(
          "flex border-white/5 border-t transition-colors duration-700",
          change && "bg-cyan-300/20 duration-0",
        )}
      >
        <span
          class={cn(
            "flex w-8 shrink-0 items-center justify-center font-bold tabular-nums",
            rank === 1 ? "bg-cyan-300 text-black" : "bg-white/10 text-white",
          )}
        >
          {rank ?? "–"}
        </span>
        <div class="min-w-0 flex-1 px-2">
          <div class="flex h-9 items-center gap-2">
            <AthleteBadge {entry} />
            <span class="min-w-0 flex-1 truncate">
              <span class="font-bold uppercase">{name.surname}</span>
              <span class="text-neutral-400 text-sm">{name.initial}</span>
            </span>
            {#if change?.gained}
              <span class="text-emerald-400 text-xs tabular-nums">
                ▲{change.gained}
              </span>
            {/if}
            {#if tag}
              <span
                class={cn(
                  "rounded-sm px-1 font-bold text-[10px]",
                  tag === "PB" ? "bg-amber-400 text-black" : "bg-white/15",
                )}
              >
                {tag}
              </span>
            {/if}
            {#if q}
              <span class="font-bold text-cyan-300 text-xs">{q}</span>
            {/if}
            <span class="flex w-16 shrink-0 flex-col items-end leading-tight">
              <span class="font-semibold tabular-nums"
                >{entry.Result || ""}</span
              >
              {#if gap && gap !== "—"}
                <span class="text-[10px] text-neutral-400 tabular-nums"
                  >{gap}</span
                >
              {/if}
            </span>
          </div>

          {#if !timed && entry.Attempts}
            <div
              class="grid grid-cols-6 gap-px pb-1.5 text-[11px] tabular-nums"
            >
              {#each attemptSlots(entry.Attempts) as attempt, i (i)}
                <span
                  class={cn(
                    "rounded-[2px] bg-white/5 text-center text-neutral-300",
                    isFoul(attempt.Line1) && "text-red-400/80",
                    attempt.Line1 &&
                      attempt.Line1 === entry.Result &&
                      "bg-cyan-300/25 font-semibold text-white",
                    change?.newAttempt === i && "ring-1 ring-cyan-300",
                  )}
                >
                  {attempt.Line1 || " "}
                </span>
              {/each}
            </div>
          {/if}
        </div>
      </li>
    {/each}
  </ol>
</div>
