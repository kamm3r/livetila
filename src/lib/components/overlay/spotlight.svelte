<script lang="ts">
  // Spotlight: the athlete who just competed, large, above a short top list.
  // Between attempts the leader holds the spotlight.
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { page } from "$app/state";
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

  const top = $derived(
    Math.max(1, Number(page.url.searchParams.get("top")) || 8),
  );
  const leader = $derived(leadingResult(view.entries, view.eventCategory));
  const timed = $derived(isTimed(view.eventCategory));
  const duration = $derived(prefersReducedMotion.current ? 0 : 300);

  const featured = $derived.by(() => {
    const latest = view.changes.latest;
    const index = latest
      ? view.entries.findIndex((entry) => entry.Id === latest.id)
      : -1;
    const at = index >= 0 ? index : 0;
    const entry = view.entries[at];
    if (!entry) return null;
    return {
      entry,
      rank: rankOf(entry, at, inHeat),
      attempt: index >= 0 ? latest!.attempt : null,
      gained: index >= 0 ? latest!.gained : 0,
    };
  });
  const visible = $derived(view.entries.slice(0, top));
</script>

<div class="w-[26rem] font-sans text-white">
  <header
    class="flex items-end justify-between gap-3 rounded-t-lg bg-neutral-950/95 px-4 pt-3 pb-2"
  >
    <div class="min-w-0">
      <p class="truncate text-neutral-400 text-xs uppercase tracking-wider">
        {view.competitionName ?? ""}
      </p>
      <h2 class="truncate font-extrabold text-2xl uppercase leading-none">
        {view.eventName ?? "…"}
      </h2>
    </div>
    <span
      class="shrink-0 rounded-sm bg-cyan-300 px-2 py-0.5 font-bold text-black text-xs uppercase"
    >
      {view.roundName ?? ""}{view.heatLabel ? ` · ${view.heatLabel}` : ""}
    </span>
  </header>

  {#if featured}
    {@const name = shortName(featured.entry)}
    {@const tag = recordTag(featured.entry, view.eventCategory)}
    {@const attempts = attemptSlots(featured.entry.Attempts)}
    {#key featured.entry.Id}
      <section
        in:fade={{ duration }}
        class="border-cyan-300 border-t-2 bg-gradient-to-br from-neutral-800 to-neutral-950 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p
              class="font-semibold text-cyan-300 text-xs uppercase tracking-wider"
            >
              {#if featured.attempt !== null}
                Yritys {featured.attempt + 1}
              {:else}
                Johtaja
              {/if}
            </p>
            <p class="truncate font-extrabold text-3xl uppercase leading-tight">
              {name.surname}
            </p>
            <p
              class="flex items-center gap-1.5 truncate text-neutral-400 text-sm"
            >
              <AthleteBadge entry={featured.entry} />
              {featured.entry.Firstname ?? ""}
              {#if featured.entry.Organization?.Name}
                · {featured.entry.Organization.Name}
              {/if}
            </p>
          </div>
          <div class="shrink-0 text-right">
            <p class="font-black text-4xl tabular-nums leading-none">
              {(featured.attempt !== null
                ? featured.entry.Attempts?.[featured.attempt]?.Line1
                : null) ||
                featured.entry.Result ||
                "–"}
            </p>
            <p class="mt-1 flex items-center justify-end gap-1.5 text-sm">
              {#if tag}
                <span
                  class="rounded-sm bg-amber-400 px-1 font-bold text-black text-xs"
                >
                  {tag}
                </span>
              {/if}
              {#if featured.rank}
                <span>Sija {featured.rank}</span>
              {/if}
              {#if featured.gained}
                <span class="text-emerald-400">▲{featured.gained}</span>
              {/if}
            </p>
          </div>
        </div>

        {#if !timed && featured.entry.Attempts?.length}
          <ol
            class="mt-3 grid grid-cols-6 gap-1 text-center text-sm tabular-nums"
          >
            {#each attempts as attempt, i (i)}
              <li
                class={cn(
                  "rounded bg-white/5 py-1",
                  isFoul(attempt.Line1) && "text-red-400",
                  attempt.Line1 === featured.entry.Result &&
                    "bg-cyan-300/25 font-bold",
                  featured.attempt === i && "ring-2 ring-cyan-300",
                )}
              >
                {attempt.Line1 || " "}
                {#if attempt.Line2}
                  <span class="block text-[10px] text-neutral-400"
                    >{attempt.Line2}</span
                  >
                {/if}
              </li>
            {/each}
          </ol>
        {/if}
      </section>
    {/key}
  {/if}

  <ol class="overflow-hidden rounded-b-lg bg-neutral-950/90">
    {#each visible as entry, index (entry.Id)}
      {@const rank = rankOf(entry, index, inHeat)}
      {@const name = shortName(entry)}
      {@const gap = gapToLeader(entry.Result, leader, view.eventCategory)}
      {@const q = qualification(entry)}
      <li
        animate:flip={{ duration }}
        class={cn(
          "flex h-8 items-center gap-2 border-white/5 border-t px-3 text-sm transition-colors duration-700",
          entry.Id === featured?.entry.Id && "bg-white/10",
          view.changes.get(entry.Id) && "bg-cyan-300/20 duration-0",
        )}
      >
        <span
          class={cn(
            "w-5 text-right font-bold tabular-nums",
            rank === 1 ? "text-cyan-300" : "text-neutral-400",
          )}
        >
          {rank ?? "–"}
        </span>
        <AthleteBadge {entry} />
        <span class="min-w-0 flex-1 truncate">
          <span class="font-semibold uppercase">{name.surname}</span>
          <span class="text-neutral-500">{name.initial}</span>
        </span>
        {#if q}<span class="font-bold text-cyan-300 text-xs">{q}</span>{/if}
        <span class="w-14 text-right text-neutral-500 text-xs tabular-nums">
          {gap && gap !== "—" ? gap : ""}
        </span>
        <span class="w-14 text-right font-semibold tabular-nums">
          {entry.Result || ""}
        </span>
      </li>
    {/each}
  </ol>

  {#if view.isRefreshError}
    <p
      role="status"
      class="mt-1 inline-block rounded-sm bg-amber-400 px-2 text-black text-xs"
    >
      Päivitys viivästyy
    </p>
  {/if}
</div>
