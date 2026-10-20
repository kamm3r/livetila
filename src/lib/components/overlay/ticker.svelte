<script lang="ts">
  // Lower third: a full-width scrolling standings bar for the bottom of the
  // frame, with the newest attempt popping up above it.
  import { fly } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { recordTag } from "$lib/results";
  import ActiveAttempt from "$lib/components/active-attempt.svelte";
  import AthleteBadge from "$lib/components/athlete-badge.svelte";
  import {
    qualification,
    rankOf,
    shortName,
    type OverlayView,
  } from "./overlay";

  let {
    view,
    inHeat,
    records,
  }: {
    view: OverlayView;
    inHeat: boolean;
    // Overrides `?records=0`, for previews outside the overlay page.
    records?: boolean;
  } = $props();
  // `?records=0` drops the SB and PB tags, as in the other overlays.
  const showRecords = $derived(
    records ?? page.url.searchParams.get("records") !== "0",
  );

  // `?accent=5ed6cb` matches a stream's branding, as in the other overlays.
  const accent = $derived.by(() => {
    const value = page.url.searchParams.get("accent");
    return value && /^[\da-f]{6}$/i.test(value) ? `#${value}` : "#67e8f9";
  });

  const latest = $derived.by(() => {
    const change = view.changes.latest;
    // Only show the callout while its row is still highlighted.
    if (!change || !view.changes.get(change.id)) return null;
    const index = view.entries.findIndex((entry) => entry.Id === change.id);
    const entry = view.entries[index];
    if (!entry) return null;
    const attempt = entry.Attempts?.[change.attempt]?.Line1;
    return { entry, rank: rankOf(entry, index, inHeat), attempt, change };
  });

  // Scroll speed stays constant regardless of how many athletes there are.
  const seconds = $derived(Math.max(20, view.entries.length * 4));
  const scrolls = $derived(
    !prefersReducedMotion.current && view.entries.length > 4,
  );
</script>

<div
  class="fixed inset-x-0 bottom-0 p-6 font-semibold text-white tracking-tight"
  style:--accent={accent}
>
  {#if latest && view.showAttempts}
    {@const name = shortName(latest.entry)}
    {@const tag = showRecords
      ? recordTag(latest.entry, view.eventCategory)
      : null}
    <div
      transition:fly={{
        y: 24,
        duration: prefersReducedMotion.current ? 0 : 250,
      }}
      class="mb-0.5 ml-auto flex w-fit items-stretch border-(--accent) border-t-2 bg-neutral-950/90"
      role="status"
    >
      <span
        class="flex items-center bg-(--accent) px-3 text-black text-xs uppercase"
      >
        Yritys {latest.change.attempt + 1}
      </span>
      <span class="flex items-center gap-2 px-3 py-2">
        <AthleteBadge entry={latest.entry} /><ActiveAttempt
          active={view.activeAllocationIds.has(latest.entry.AllocId)}
        />
        <span class="uppercase">{name.surname}</span>
        <span class="text-neutral-400">{name.initial}</span>
      </span>
      <span
        class="flex items-center bg-white/5 px-3 font-bold text-2xl tabular-nums"
      >
        {latest.attempt || latest.entry.Result}
      </span>
      {#if tag}
        <span class="flex items-center bg-(--accent) px-2 text-black text-xs">
          {tag}
        </span>
      {/if}
      {#if latest.rank}
        <span class="flex items-center bg-white/10 px-3 text-sm">
          Sija {latest.rank}
          {#if latest.change.gained}
            <span class="ml-1 text-(--accent)">▲{latest.change.gained}</span>
          {/if}
        </span>
      {/if}
    </div>
  {/if}

  <div
    class="flex h-12 items-stretch border-(--accent) border-t-2 bg-neutral-950/90"
  >
    <div
      class="flex shrink-0 flex-col justify-center bg-(--accent) px-4 text-black"
    >
      <span class="uppercase leading-tight">
        {view.eventName ?? "…"}
      </span>
      <span class="font-medium text-[11px] uppercase leading-tight">
        {view.roundName ?? ""}{view.heatLabel
          ? ` · ${view.heatLabel}`
          : ""}{view.wind ? ` · ${view.wind}` : ""}
      </span>
    </div>

    <div
      class="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_2rem,#000_calc(100%-2rem),transparent)]"
    >
      <div
        class={cn("flex h-full w-max items-center", scrolls && "ticker-track")}
        style:--ticker-duration="{seconds}s"
      >
        <!-- The list is repeated once so the loop has no visible seam. -->
        {#each scrolls ? [0, 1] : [0] as copy (copy)}
          <ol
            class="flex items-center pl-6"
            aria-hidden={copy === 1 || undefined}
          >
            {#each view.entries as entry, index (entry.Id)}
              {@const rank = rankOf(entry, index, inHeat)}
              {@const name = shortName(entry)}
              {@const q = qualification(entry)}
              <li
                class={cn(
                  "flex items-center gap-2 whitespace-nowrap px-3 py-1 transition-colors duration-700",
                  view.changes.get(entry.Id) && "bg-(--accent)/25 duration-0",
                )}
              >
                <span
                  class={cn(
                    "flex size-6 items-center justify-center text-sm tabular-nums",
                    rank === 1 ? "bg-(--accent) text-black" : "bg-white/10",
                  )}
                >
                  {rank ?? "–"}
                </span>
                <AthleteBadge {entry} /><ActiveAttempt
                  active={view.activeAllocationIds.has(entry.AllocId)}
                />
                <span class="uppercase">{name.surname}</span>
                <span class="text-(--accent) tabular-nums">
                  {entry.Result || "–"}
                </span>
                {#if q}<span class="text-xs">{q}</span>{/if}
              </li>
              {#if scrolls || index < view.entries.length - 1}
                <li aria-hidden="true" class="text-white/20">/</li>
              {/if}
            {/each}
          </ol>
        {/each}
      </div>
    </div>

    <div
      class="flex shrink-0 items-center gap-1.5 border-white/10 border-l px-4"
    >
      <span class="size-2 rounded-full bg-red-500 motion-safe:animate-pulse"
      ></span>
      <span class="text-red-400 text-xs tracking-[0.12em]">
        {view.isRefreshError ? "VIIVE" : "LIVE"}
      </span>
    </div>
  </div>
</div>

<style>
  .ticker-track {
    animation: ticker var(--ticker-duration) linear infinite;
  }

  @keyframes ticker {
    to {
      transform: translateX(-50%);
    }
  }
</style>
