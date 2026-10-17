<script lang="ts">
  // Championship TV style with a pinned card: the standings never change
  // height, and the athlete who just competed is shown below the list with
  // their series, attempt result and places gained.
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { isTimed, recordTag, turnOrder } from "$lib/results";
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
  const turn = $derived(timed ? null : turnOrder(view.entries));
  const focusId = $derived(
    timed ? null : (view.changes.latest?.id ?? turn?.previous?.Id ?? null),
  );
  const top = $derived(Number(page.url.searchParams.get("top")) || Infinity);
  const visible = $derived(view.entries.slice(0, top));
  const focused = $derived.by(() => {
    const index = view.entries.findIndex((entry) => entry.Id === focusId);
    const entry = view.entries[index];
    if (!entry) return null;
    const latest = view.changes.latest;
    const attempt = latest?.id === entry.Id ? latest.attempt : null;
    return {
      entry,
      rank: rankOf(entry, index, inHeat),
      attempt,
      value:
        attempt !== null
          ? entry.Attempts?.[attempt]?.Line1
          : entry.Attempts?.at(-1)?.Line1,
      gained: latest?.id === entry.Id ? latest.gained : 0,
    };
  });

  const unit = (result?: string | null) =>
    !timed && result && /^\d+[.,]\d+$/.test(result) ? "m" : "";
</script>

{#snippet mark(result?: string | null)}
  {result ?? ""}{#if unit(result)}<span
      class="ml-px text-[0.8em] normal-case opacity-70">{unit(result)}</span
    >{/if}
{/snippet}

<div class="w-72 font-semibold text-white uppercase tracking-tight">
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
      <h2 class="min-w-0 flex-1 truncate bg-cyan-300 px-2 py-0.5 text-black">
        {view.eventName ?? ""}
      </h2>
      <span
        class="flex w-20 items-center justify-center bg-neutral-950 text-[10px] text-neutral-300"
      >
        {timed ? "Aika" : "Tulos"}
      </span>
    </div>
  </header>

  <ol class="bg-neutral-950/85">
    {#each visible as entry, index (entry.Id)}
      {@const change = view.changes.get(entry.Id)}
      {@const rank = rankOf(entry, index, inHeat)}
      {@const isFocus = entry.Id === focusId}
      {@const q = qualification(entry)}
      <li
        animate:flip={{ duration }}
        class={cn(
          "flex h-7 items-stretch border-neutral-950 border-t transition-colors duration-700 first:border-t-0",
          isFocus && "bg-white/15",
          change && "bg-cyan-300/30 duration-0",
        )}
      >
        <span
          class={cn(
            "flex w-7 shrink-0 items-center justify-center tabular-nums",
            isFocus && "bg-cyan-300 text-black",
          )}
        >
          {rank ?? ""}
        </span>
        <span class="flex w-7 shrink-0 items-center justify-center">
          <AthleteBadge {entry} />
        </span>
        <span class="flex min-w-0 flex-1 items-center gap-1.5 pl-1">
          <span class="truncate">{entry.Surname || entry.Name}</span>
          {#if q}<span class="text-cyan-300 text-xs">{q}</span>{/if}
        </span>
        <span
          class="flex w-20 shrink-0 items-center justify-end bg-white/10 px-2 tabular-nums"
        >
          {@render mark(entry.Result)}
        </span>
      </li>
    {/each}
  </ol>

  {#if focused}
    {@const tag = recordTag(focused.entry, view.eventCategory)}
    {#key focused.entry.Id}
      <section
        in:fly={{ y: 12, duration }}
        class="mt-1 border-cyan-300 border-t-2 bg-neutral-950/90"
      >
        <div class="flex items-stretch">
          <span
            class="flex items-center bg-cyan-300 px-2 text-[10px] text-black"
          >
            {focused.attempt !== null
              ? `Yritys ${focused.attempt + 1}`
              : "Viimeksi"}
          </span>
          <span class="flex min-w-0 flex-1 items-center gap-1.5 px-2 py-1">
            <AthleteBadge entry={focused.entry} />
            <span class="truncate">
              {focused.entry.Surname || focused.entry.Name}
            </span>
          </span>
          <span class="flex items-center px-2 text-xl tabular-nums">
            {@render mark(focused.value || focused.entry.Result)}
          </span>
        </div>
        <ol
          class="grid grid-cols-6 bg-neutral-300 text-black normal-case tabular-nums"
        >
          {#each attemptSlots(focused.entry.Attempts) as attempt, i (i)}
            <li
              class={cn(
                "flex flex-col px-1 pt-0.5 pb-1 odd:bg-neutral-200",
                !attempt.Line1 && "bg-neutral-100! text-neutral-500",
                attempt.Line1 &&
                  attempt.Line1 === focused.entry.Result &&
                  "bg-cyan-300!",
                focused.attempt === i &&
                  "outline-2 outline-black -outline-offset-2",
              )}
            >
              <span class="text-[10px] text-neutral-500 leading-none"
                >{i + 1}</span
              >
              <span
                class={cn(
                  "text-center text-sm leading-tight",
                  isFoul(attempt.Line1) && "text-red-700",
                )}
              >
                {attempt.Line1 || " "}
              </span>
            </li>
          {/each}
        </ol>
        <div
          class="flex items-center justify-between px-2 py-0.5 text-xs normal-case"
        >
          <span class="flex items-center gap-1.5">
            {#if focused.rank}
              <span>Sija {focused.rank}</span>
            {/if}
            {#if focused.gained}
              <span class="text-cyan-300">▲{focused.gained}</span>
            {/if}
            {#if tag}<span class="bg-cyan-300 px-1 text-black">{tag}</span>{/if}
          </span>
          {#if turn?.next && turn.next.Id !== focused.entry.Id}
            <span class="truncate text-neutral-400">
              Vuorossa: {turn.next.Surname || turn.next.Name}
            </span>
          {/if}
        </div>
      </section>
    {/key}
  {/if}

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
