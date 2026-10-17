<script lang="ts">
  // Championship TV style as a full results board: every athlete's series in
  // numbered columns, for showing between rounds. Track events drop the
  // attempt columns and show the gap to the winner instead.
  import { flip } from "svelte/animate";
  import { prefersReducedMotion } from "svelte/motion";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import {
    eliminatedAfterThree,
    gapToLeader,
    isTimed,
    leadingResult,
    recordTag,
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
  const duration = $derived(prefersReducedMotion.current ? 0 : 250);
  const leader = $derived(leadingResult(view.entries, view.eventCategory));
  const out = $derived(eliminatedAfterThree(view.entries));
  const top = $derived(Number(page.url.searchParams.get("top")) || Infinity);
  const visible = $derived(view.entries.slice(0, top));
  const latestId = $derived(view.changes.latest?.id ?? null);

  const unit = (result?: string | null) =>
    !timed && result && /^\d+[.,]\d+$/.test(result) ? "m" : "";
</script>

{#snippet mark(result?: string | null)}
  {result ?? ""}{#if unit(result)}<span
      class="ml-px text-[0.8em] normal-case opacity-70">{unit(result)}</span
    >{/if}
{/snippet}

<div class="w-fit font-semibold text-white uppercase tracking-tight">
  <header class="border-cyan-300 border-t-2 bg-neutral-950/90">
    <div class="flex items-center justify-between px-2 py-0.5">
      <span class="text-cyan-300">
        {view.roundName ?? ""}{view.heatLabel ? ` · ${view.heatLabel}` : ""}
      </span>
      {#if view.wind}
        <span class="text-neutral-400 text-xs normal-case tabular-nums"
          >{view.wind} m/s</span
        >
      {/if}
    </div>
    <div class="flex items-stretch">
      <h2 class="w-64 truncate bg-cyan-300 px-2 py-0.5 text-black">
        {view.eventName ?? ""}
      </h2>
      {#if !timed}
        <span
          class="grid w-72 grid-cols-6 items-center bg-neutral-950 text-center text-[10px] text-neutral-400"
        >
          {#each [1, 2, 3, 4, 5, 6] as n (n)}<span>{n}</span>{/each}
        </span>
      {:else}
        <span
          class="flex w-20 items-center justify-center bg-neutral-950 text-[10px] text-neutral-400"
          >Ero</span
        >
      {/if}
      <span
        class="flex w-20 items-center justify-center bg-neutral-950 text-[10px] text-neutral-300"
      >
        {timed ? "Aika" : "Paras"}
      </span>
    </div>
  </header>

  <ol class="bg-neutral-950/85">
    {#each visible as entry, index (entry.Id)}
      {@const change = view.changes.get(entry.Id)}
      {@const rank = rankOf(entry, index, inHeat)}
      {@const tag = recordTag(entry, view.eventCategory)}
      {@const q = qualification(entry)}
      {@const gap = gapToLeader(entry.Result, leader, view.eventCategory)}
      {@const isOut = out.has(entry.Id)}
      <li
        animate:flip={{ duration }}
        class={cn(
          "flex h-7 items-stretch border-neutral-950 border-t transition-colors duration-700 first:border-t-0",
          entry.Id === latestId && "bg-white/15",
          change && "bg-cyan-300/30 duration-0",
          isOut && "text-neutral-400",
        )}
      >
        <span
          class={cn(
            "flex w-7 shrink-0 items-center justify-center tabular-nums",
            entry.Id === latestId && "bg-cyan-300 text-black",
          )}
        >
          {rank ?? ""}
        </span>
        <span class="flex w-7 shrink-0 items-center justify-center">
          <AthleteBadge {entry} />
        </span>
        <span class="flex w-50 min-w-0 items-center gap-1.5 pl-1">
          <span class="truncate">{entry.Surname || entry.Name}</span>
          {#if tag}
            <span class="bg-cyan-300 px-1 text-[10px] text-black">{tag}</span>
          {/if}
          {#if q}<span class="text-cyan-300 text-xs">{q}</span>{/if}
        </span>

        {#if !timed}
          <ol class="grid w-72 grid-cols-6 text-sm normal-case tabular-nums">
            {#each attemptSlots(entry.Attempts) as attempt, i (i)}
              <li
                class={cn(
                  "flex items-center justify-center bg-neutral-300 text-black odd:bg-neutral-200",
                  !attempt.Line1 && "bg-neutral-100/80! text-neutral-500",
                  isOut && i >= 3 && "hatch bg-neutral-500/60!",
                  isFoul(attempt.Line1) && "text-red-700",
                  attempt.Line1 &&
                    attempt.Line1 === entry.Result &&
                    "bg-cyan-300! font-bold",
                  change?.newAttempt === i && "animate-pulse",
                )}
              >
                {attempt.Line1 || ""}
              </li>
            {/each}
          </ol>
        {:else}
          <span
            class="flex w-20 items-center justify-end px-2 text-neutral-400 text-xs tabular-nums"
          >
            {gap && gap !== "—" ? gap : ""}
          </span>
        {/if}

        <span
          class="flex w-20 shrink-0 items-center justify-end bg-white/10 px-2 tabular-nums"
        >
          {@render mark(entry.Result)}
        </span>
      </li>
    {/each}
  </ol>

  <footer class="mt-1 flex items-center gap-2">
    <span class="bg-neutral-950/90 px-2 py-0.5 text-cyan-300">
      {view.competitionName ?? ""}
    </span>
    {#if view.isRefreshError}
      <span
        role="status"
        class="bg-neutral-950/90 px-2 py-0.5 text-neutral-300 text-xs normal-case"
      >
        Päivitys viivästyy
      </span>
    {/if}
  </footer>
</div>
