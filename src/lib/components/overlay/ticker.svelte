<script lang="ts">
  // Lower third: a full-width scrolling standings bar for the bottom of the
  // frame, with the newest attempt popping up above it.
  import { fly, scale } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { untrack } from "svelte";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { gapToLeader, isTimed, leadingResult, recordTag } from "$lib/results";
  import ActiveAttempt from "$lib/components/active-attempt.svelte";
  import AthleteBadge from "$lib/components/athlete-badge.svelte";
  import {
    isFoul,
    qualification,
    rankOf,
    shortName,
    type OverlayEntry,
    type OverlayView,
  } from "./overlay";

  let {
    view,
    inHeat,
    gaps,
    records,
  }: {
    view: OverlayView;
    inHeat: boolean;
    // Overrides `?gap=0`, for previews outside the overlay page.
    gaps?: boolean;
    // Overrides `?records=0`, for previews outside the overlay page.
    records?: boolean;
  } = $props();
  // `?gap=0` drops each athlete's gap to the leader, as on the board.
  const showGaps = $derived(gaps ?? page.url.searchParams.get("gap") !== "0");
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

  // A new attempt is revealed as on the list: the callout opens with the mark
  // pending (three dots) while the standings stay as they were; then the mark
  // appears and each athlete's place, mark and gap update where they stand.
  // Running events have no attempts to hold back.
  const revealDelay = $derived(
    prefersReducedMotion.current || isTimed(view.eventCategory) ? 0 : 1500,
  );
  const motion = $derived(prefersReducedMotion.current ? 0 : 1);
  let staged = $state.raw(untrack(() => view.entries));
  let pending = $state(false);
  // The poll before the latest one: the standings without the new attempt.
  let lastLive = untrack(() => view.entries);
  let previousLive = lastLive;
  let seen: unknown = null;
  let revealTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const live = view.entries;
    const latest = view.changes.latest;
    const delay = revealDelay;
    if (live !== lastLive) {
      previousLive = lastLive;
      lastLive = live;
    }
    if (latest && latest !== seen && delay > 0) {
      seen = latest;
      pending = true;
      staged = previousLive;
      clearTimeout(revealTimer);
      revealTimer = setTimeout(() => {
        pending = false;
        staged = untrack(() => view.entries);
      }, delay);
    } else if (!untrack(() => pending)) {
      seen = latest;
      staged = live;
    }
  });
  $effect(() => () => clearTimeout(revealTimer));

  const leader = $derived(leadingResult(staged, view.eventCategory));
  const gapOf = (entry: OverlayEntry) => {
    const gap = showGaps
      ? gapToLeader(entry.Result, leader, view.eventCategory)
      : null;
    return gap && gap !== "—" ? gap : null;
  };

  // Scroll speed stays constant regardless of how many athletes there are.
  const seconds = $derived(Math.max(20, view.entries.length * 4));
  const scrolls = $derived(
    !prefersReducedMotion.current && view.entries.length > 4,
  );

  // A scrolling crawl keeps its order on screen, as broadcast tickers do:
  // places, marks and gaps update where the athletes stand. The list runs
  // twice so the loop has no seam, and the new order goes into the second
  // copy only while that copy is out of view to the right; it then scrolls
  // in as part of the crawl, and at the loop the first copy takes the same
  // order, so the reset swaps identical content. A ticker that does not
  // scroll re-sorts at once.
  const ids = $derived(staged.map((entry) => entry.Id));
  let shownOrder = $state<number[]>(untrack(() => ids));
  let nextOrder = $state<number[]>(untrack(() => ids));
  let viewport = $state<HTMLElement | null>(null);
  let secondCopy = $state<HTMLElement | null>(null);
  const same = (a: number[], b: number[]) =>
    a.length === b.length && a.every((id, i) => id === b[i]);
  // Athletes joining or leaving show up at once, in either copy.
  const reconcile = (order: number[], wanted: number[]) => {
    const kept = order.filter((id) => wanted.includes(id));
    const added = wanted.filter((id) => !order.includes(id));
    return kept.length === order.length && added.length === 0
      ? order
      : [...kept, ...added];
  };
  function queueHidden() {
    const copy = secondCopy?.getBoundingClientRect();
    const view = viewport?.getBoundingClientRect();
    if (copy && view && copy.left >= view.right && !same(nextOrder, ids))
      nextOrder = ids;
  }
  $effect(() => {
    const wanted = ids;
    if (!scrolls) {
      shownOrder = wanted;
      nextOrder = wanted;
      return;
    }
    untrack(() => {
      shownOrder = reconcile(shownOrder, wanted);
      nextOrder = reconcile(nextOrder, wanted);
      queueHidden();
    });
  });
  // The second copy can leave the view while nothing changes; look again
  // until the new order has been placed.
  $effect(() => {
    if (!scrolls || same(nextOrder, ids)) return;
    const timer = setInterval(queueHidden, 250);
    return () => clearInterval(timer);
  });
  // Only the track's own loop counts; the on-turn dots inside it animate too.
  const restartLoop = (event: AnimationEvent) => {
    if (event.target !== event.currentTarget) return;
    // A list narrower than the view never leaves it; it re-sorts at the loop.
    const copy = secondCopy?.getBoundingClientRect();
    const view = viewport?.getBoundingClientRect();
    if (copy && view && copy.width < view.width) nextOrder = ids;
    shownOrder = nextOrder;
    queueHidden();
  };
  const crawlOf = (order: number[]) => {
    const byId = new Map(staged.map((entry, index) => [entry.Id, index]));
    return order.flatMap((id) => {
      const index = byId.get(id);
      return index === undefined ? [] : [{ entry: staged[index]!, index }];
    });
  };
</script>

<div
  class="fixed inset-x-0 bottom-0 p-6 font-semibold text-white"
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
      class="mb-0.5 ml-auto flex w-fit items-stretch whitespace-nowrap border-(--accent) border-t-2 bg-neutral-950"
      role="status"
    >
      <span
        class="flex items-center bg-(--accent) px-3 text-black text-xs uppercase"
      >
        Yritys {latest.change.attempt + 1}
      </span>
      <span class="flex items-center gap-2 px-3 py-2">
        <AthleteBadge entry={latest.entry} />
        <span class="text-neutral-400">{name.initial}</span>
        <span class="uppercase">{name.surname}</span>
        <ActiveAttempt
          active={view.activeAllocationIds.has(latest.entry.AllocId)}
        />
      </span>
      <span
        class={cn(
          "flex items-center bg-white/5 px-3 font-bold text-2xl tabular-nums",
          !pending && isFoul(latest.attempt) && "text-red-400",
        )}
      >
        {#if pending}
          <span class="waiting flex h-8 items-center gap-1">
            <span></span><span></span><span></span>
          </span>
        {:else}
          {latest.attempt || latest.entry.Result}
        {/if}
      </span>
      {#if tag && !pending}
        <span class="flex items-center bg-(--accent) px-2 text-black text-xs">
          {tag}
        </span>
      {/if}
      {#if latest.rank && !pending}
        <span class="flex items-center bg-white/10 px-3 text-sm uppercase">
          Sija {latest.rank}
          {#if latest.change.gained}
            <span class="ml-1 text-(--accent)">▲{latest.change.gained}</span>
          {/if}
        </span>
      {/if}
    </div>
  {/if}

  <div
    class="flex h-12 items-stretch border-(--accent) border-t-2 bg-neutral-950"
  >
    <div
      class="flex shrink-0 flex-col justify-center bg-(--accent) px-4 text-black"
    >
      <span class="uppercase leading-tight">
        {view.eventName ?? "…"}
      </span>
      <span class="font-medium text-xs uppercase leading-tight">
        {view.roundName ?? ""}{view.heatLabel
          ? ` · ${view.heatLabel}`
          : ""}{view.wind ? ` · ${view.wind}` : ""}
      </span>
    </div>

    <div
      bind:this={viewport}
      class="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_2rem,#000_calc(100%-2rem),transparent)]"
    >
      <div
        class={cn("flex h-full w-max items-center", scrolls && "ticker-track")}
        style:--ticker-duration="{seconds}s"
        onanimationiteration={restartLoop}
      >
        <!-- The list is repeated once so the loop has no visible seam. -->
        {#each scrolls ? [0, 1] : [0] as copy (copy)}
          {@const crawl = crawlOf(copy === 1 ? nextOrder : shownOrder)}
          <ol
            class="flex items-center pl-6"
            aria-hidden={copy === 1 || undefined}
            bind:this={
              () => (copy === 1 ? secondCopy : null),
              (el) => {
                if (copy === 1) secondCopy = el;
              }
            }
          >
            {#each crawl as { entry, index } (entry.Id)}
              {@const rank = rankOf(entry, index, inHeat)}
              {@const name = shortName(entry)}
              {@const q = qualification(entry)}
              {@const gap = gapOf(entry)}
              {@const change = pending ? undefined : view.changes.get(entry.Id)}
              <!-- Changes happen in place, as on a broadcast ticker: the mark
                   pops in, the place rolls over and a gain is marked, while
                   the crawl keeps moving. -->
              <li
                class={cn(
                  "flex items-center gap-2 whitespace-nowrap px-5 py-1 transition-colors duration-700",
                  view.changes.get(entry.Id) && "bg-(--accent)/25 duration-0",
                )}
              >
                <span
                  class={cn(
                    "flex size-6 items-center justify-center overflow-hidden text-sm tabular-nums",
                    rank === 1 ? "bg-(--accent) text-black" : "bg-white/10",
                  )}
                >
                  {#key rank}<span in:fly={{ y: 14, duration: 350 * motion }}
                      >{rank ?? "–"}</span
                    >{/key}
                </span>
                <AthleteBadge {entry} />
                <span class="uppercase">{name.surname}</span>
                <ActiveAttempt
                  active={view.activeAllocationIds.has(entry.AllocId)}
                />
                <!-- Results stay white; the accent is kept for the leader and
                     for changes. -->
                {#key entry.Result}<span
                    in:scale={{ start: 0.6, duration: 300 * motion }}
                    class="inline-block tabular-nums"
                    >{entry.Result || "–"}</span
                  >{/key}
                {#if change?.gained}<span class="text-(--accent) text-sm"
                    ><span aria-hidden="true">▲{change.gained}</span><span
                      class="sr-only">noussut {change.gained} sijaa</span
                    ></span
                  >{/if}
                {#if gap}<span class="text-neutral-400 text-sm tabular-nums"
                    >{gap}</span
                  >{/if}
                {#if q}<span class="text-xs">{q}</span>{/if}
              </li>
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
      <span class="text-red-400 text-xs">
        {view.isRefreshError ? "VIIVE" : "LIVE"}
      </span>
    </div>
  </div>
</div>

<style>
  /* Three dots stand in for an attempt that is about to be shown. */
  .waiting > span {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: currentColor;
    animation: waiting 1s ease-in-out infinite;
  }
  .waiting > span:nth-child(2) {
    animation-delay: 0.15s;
  }
  .waiting > span:nth-child(3) {
    animation-delay: 0.3s;
  }
  @keyframes waiting {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-5px);
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .waiting > span {
      animation: none;
    }
  }

  .ticker-track {
    animation: ticker var(--ticker-duration) linear infinite;
  }

  @keyframes ticker {
    to {
      transform: translateX(-50%);
    }
  }
</style>
