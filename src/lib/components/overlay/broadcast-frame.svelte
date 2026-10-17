<script lang="ts">
  // Championship TV frame: accent rules above and below the list, every
  // athlete on their own bar, and the athlete who just competed opened up to
  // show a numbered series. Each row carries a low-key gap after the name,
  // measured against the athlete who just competed ("+1.26" ahead, "−3.02"
  // behind), or against the leader when nobody is focused. Athletes within
  // 2% of the lead are marked. `?gap=0` hides the gap, and `?accent=5ed6cb`
  // swaps the accent colour to match a stream's branding.
  import { fade, fly, slide } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import type { AnimationConfig } from "svelte/animate";
  import { prefersReducedMotion } from "svelte/motion";
  import { untrack } from "svelte";
  import { SvelteMap, SvelteSet } from "svelte/reactivity";
  import { Camera } from "@lucide/svelte";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import type { LatestAttempt } from "$lib/result-changes.svelte";
  import {
    attemptCount,
    isTimed,
    isVerticalJump,
    leadingResult,
    parseResult,
    recordTag,
    turnOrder,
  } from "$lib/results";
  import ActiveAttempt from "$lib/components/active-attempt.svelte";
  import AthleteBadge from "$lib/components/athlete-badge.svelte";
  import { athleteBadge } from "$lib/athlete-badge";
  import {
    attemptSlots,
    clubInitials,
    isFoul,
    qualification,
    rankOf,
    type OverlayEntry,
    type OverlayView,
  } from "./overlay";

  let {
    view,
    inHeat,
    gaps,
  }: {
    view: OverlayView;
    inHeat: boolean;
    // Overrides `?gap=0`, for previews outside the overlay page.
    gaps?: boolean;
  } = $props();

  const accent = $derived.by(() => {
    const value = page.url.searchParams.get("accent");
    return value && /^[\da-f]{6}$/i.test(value) ? `#${value}` : "#67e8f9";
  });
  const timed = $derived(isTimed(view.eventCategory));
  const duration = $derived(prefersReducedMotion.current ? 0 : 250);

  // A new attempt is revealed in stages: the athlete's series opens with the
  // new attempt still pending (three dots) while the standings stay as they
  // were; then the mark appears and pops, and the places update and the rows
  // swap. `staged` holds the data meant for the screen; the live data waits
  // until then. Running events have no attempts to hold back.
  const revealDelay = $derived(
    prefersReducedMotion.current || timed ? 0 : 1500,
  );
  let staged = $state.raw(untrack(() => view.entries));
  let pending = $state<LatestAttempt | null>(null);
  let popping = $state<{ id: number; attempt: number } | null>(null);
  // The poll before the latest one: the standings without the new attempt,
  // whether the attempt is noticed in the same update or just after it.
  let lastLive = untrack(() => view.entries);
  let previousLive = lastLive;
  let seen: LatestAttempt | null = null;
  let revealTimer: ReturnType<typeof setTimeout> | undefined;
  let popTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const live = view.entries;
    const latest = view.changes.latest;
    if (live !== lastLive) {
      previousLive = lastLive;
      lastLive = live;
    }
    // Polling rebuilds the view every 30 seconds; only a new attempt counts.
    if (latest && latest !== seen) {
      seen = latest;
      pending = latest;
      staged = previousLive;
      clearTimeout(revealTimer);
      revealTimer = setTimeout(() => {
        pending = null;
        staged = untrack(() => view.entries);
        popping = { id: latest.id, attempt: latest.attempt };
        clearTimeout(popTimer);
        popTimer = setTimeout(() => (popping = null), 1300);
      }, revealDelay);
      return;
    }
    if (!untrack(() => pending)) staged = live;
  });

  // Running events fill in like a results board: the times appear one at a
  // time from the top, each runner sliding in at the bottom of the list, and
  // a season or personal best gets a banner first. The start list clears when
  // the first time arrives; runners who never get one (DNF, DNS) join below
  // once the times have stopped. Times that arrive together are still shown
  // one by one. Times already in when the board opens show at once.
  const revealEvery = $derived(prefersReducedMotion.current ? 0 : 700);
  const revealed = new SvelteSet<number>();
  const banners = new SvelteMap<number, "PB" | "SB">();
  const bannerTimers = new Set<ReturnType<typeof setTimeout>>();
  let opened = false;
  const finishers = $derived(
    timed
      ? staged.filter((entry) => entry.Result).map((entry) => entry.Id)
      : [],
  );
  const waitingKey = $derived(
    finishers.filter((id) => !revealed.has(id)).join(),
  );
  $effect(() => {
    if (!timed) return;
    // A heat switch or a withdrawn time takes the row back to the start list.
    for (const id of untrack(() => [...revealed]))
      if (!finishers.includes(id)) revealed.delete(id);
    if (!opened && staged.length > 0) {
      opened = true;
      untrack(() => finishers.forEach((id) => revealed.add(id)));
      settled = true;
    }
  });
  // The times have stopped coming: whoever is left has no time.
  const settleAfter = 5000;
  let settled = $state(false);
  $effect(() => {
    if (!timed) return;
    if (waitingKey || revealed.size === 0) {
      settled = false;
      return;
    }
    const timer = setTimeout(() => (settled = true), settleAfter);
    return () => clearTimeout(timer);
  });
  // A banner gets the screen to itself before the next time comes in.
  const bannerFor = 2500;
  $effect(() => {
    const next = Number(waitingKey.split(",")[0]);
    if (!waitingKey || Number.isNaN(next)) return;
    const wait = untrack(() => banners.size) > 0 ? bannerFor : revealEvery;
    const timer = setTimeout(() => {
      revealed.add(next);
      const entry = untrack(() => staged.find((item) => item.Id === next));
      const tag = entry && recordTag(entry, view.eventCategory);
      if (!tag) return;
      banners.set(next, tag);
      const done = setTimeout(() => {
        banners.delete(next);
        bannerTimers.delete(done);
      }, bannerFor);
      bannerTimers.add(done);
    }, wait);
    return () => clearTimeout(timer);
  });
  $effect(() => () => bannerTimers.forEach(clearTimeout));
  // Times are coming in; rows still without one await the photo finish.
  const resultsIn = $derived(timed && revealed.size > 0);

  const entries = $derived.by(() => {
    if (!timed) return staged;
    const lane = (entry: OverlayEntry) => entry.Position || Infinity;
    const done = staged.filter((entry) => revealed.has(entry.Id));
    if (done.length > 0 && !settled) return done;
    const waiting = staged
      .filter((entry) => !revealed.has(entry.Id))
      .sort((a, b) => lane(a) - lane(b))
      .map((entry) => ({
        ...entry,
        Result: null,
        Attempts: [],
        HeatRank: 0,
        ResultRank: 0,
        QRank: false,
        QResult: false,
      }));
    return [...done, ...waiting] as OverlayEntry[];
  });
  $effect(() => () => {
    clearTimeout(revealTimer);
    clearTimeout(popTimer);
  });
  const vertical = $derived(isVerticalJump(entries));
  const turn = $derived(timed ? null : turnOrder(entries));
  // The latest attempt seen while on air, else the last athlete in the
  // starting order to have competed. Nobody is focused before that.
  const focusId = $derived(
    timed ? null : (view.changes.latest?.id ?? turn?.previous?.Id ?? null),
  );

  // Reorders run in two steps, like a timing tower: the new place numbers
  // land first, then the rows swap.
  const swapDelay = 450;
  const swapDuration = $derived(prefersReducedMotion.current ? 0 : 400);
  let order = $state<number[]>([]);
  // Only a reorder slides rows; a row opening its series moves the rest itself.
  let swapping = false;
  $effect(() => {
    const ids = entries.map((entry) => entry.Id);
    const shown = untrack(() => order);
    if (ids.join() === shown.join()) return;
    const sameField =
      ids.length === shown.length && ids.every((id) => shown.includes(id));
    if (!sameField || prefersReducedMotion.current) {
      order = ids;
      return;
    }
    const timer = setTimeout(() => {
      swapping = true;
      order = ids;
      setTimeout(() => (swapping = false));
    }, swapDelay);
    return () => clearTimeout(timer);
  });
  // Like `flip`, but rows only slide: a row that grows to show its series
  // must not be squashed while it moves.
  // A running event's results slide in from the side, the rest fade.
  function enter(node: HTMLElement) {
    return timed
      ? fly(node, { x: -24, duration: duration ? 300 : 0 })
      : fade(node, { duration });
  }

  function swap(
    node: HTMLElement,
    { from, to }: { from: DOMRect; to: DOMRect },
  ): AnimationConfig {
    // Rects include any page zoom; transforms do not.
    const dy = ((from.top - to.top) * node.clientHeight) / to.height;
    if (!swapping || !dy) return { duration: 0 };
    return {
      duration: swapDuration,
      easing: cubicInOut,
      css: (_t, u) => `transform: translateY(${u * dy}px)`,
    };
  }
  const ordered = $derived.by(() => {
    const byId = new Map(entries.map((entry) => [entry.Id, entry]));
    const list = order.flatMap((id) => byId.get(id) ?? []);
    return list.length === entries.length ? list : entries;
  });
  // Where each athlete stands now, while the rows may still be in the old order.
  const places = $derived(
    new Map(entries.map((entry, index) => [entry.Id, index])),
  );

  const visible = $derived(ordered.map((entry, index) => ({ entry, index })));

  const leader = $derived(leadingResult(entries, view.eventCategory));

  // Distance to the leader, "-1.26" in the field and "+0.42" on the track.
  function gapOf(result: string | null) {
    const best = parseResult(leader, view.eventCategory);
    const value = parseResult(result, view.eventCategory);
    if (best <= 0 || value <= 0 || result === leader) return null;
    const gap = timed
      ? `+${((value - best) / 1000).toFixed(2)}`
      : `−${(best - value).toFixed(2)}`;
    return result?.includes(",") ? gap.replace(".", ",") : gap;
  }

  const showGaps = $derived(gaps ?? page.url.searchParams.get("gap") !== "0");
  const focusedResult = $derived(
    entries.find((entry) => entry.Id === focusId)?.Result ?? null,
  );
  function rowGap(result: string | null) {
    if (!showGaps) return null;
    return focusedResult ? diffTo(result) : gapOf(result);
  }

  // Distance from the athlete who just competed: "+1.26" for a better mark,
  // "−3.02" for a worse one. Only field events have a focused athlete.
  function diffTo(result: string | null) {
    const base = parseResult(focusedResult, view.eventCategory);
    const value = parseResult(result, view.eventCategory);
    if (base <= 0 || value <= 0 || result === focusedResult) return null;
    const diff = `${value > base ? "+" : "−"}${Math.abs(value - base).toFixed(2)}`;
    return result?.includes(",") ? diff.replace(".", ",") : diff;
  }

  // Within 2% of the lead: one good attempt can take it.
  function close(result: string | null) {
    const best = parseResult(leader, view.eventCategory);
    const value = parseResult(result, view.eventCategory);
    return (
      !focusedResult &&
      best > 0 &&
      value > 0 &&
      result !== leader &&
      Math.abs(best - value) / best <= 0.02
    );
  }

  // An athlete who has competed without a valid mark gets a dash.
  const shown = (entry: OverlayEntry) =>
    entry.Result || (attemptCount(entry) > 0 ? "–" : null);

  // Field marks get a unit; times and statuses (DNS, NM) are shown as is.
  const unit = (result?: string | null) =>
    !timed && result && /^\d+[.,]\d+$/.test(result) ? "m" : "";
</script>

{#snippet mark(result?: string | null)}
  {result ?? ""}{#if unit(result)}<span
      class="ml-px text-[0.8em] normal-case opacity-70">{unit(result)}</span
    >{/if}
{/snippet}

<div
  class="w-72 font-semibold text-white uppercase tracking-tight"
  style:--accent={accent}
>
  <header class="border-(--accent) border-t-2 bg-neutral-950/90">
    <div class="flex h-6 items-center justify-between px-2">
      <span class="truncate text-(--accent)">
        {#if timed}
          {view.roundName ? `${view.roundName} – ` : ""}{resultsIn
            ? "Tulokset"
            : "Lähtölista"}
        {:else}
          {view.roundName ?? ""}
        {/if}
      </span>
      {#if view.wind}
        <span class="shrink-0 text-neutral-400 text-xs normal-case tabular-nums"
          >{view.wind} m/s</span
        >
      {/if}
    </div>
    <div class="flex items-stretch">
      <h2 class="min-w-0 flex-1 truncate bg-(--accent) px-2 py-0.5 text-black">
        {view.eventName ?? ""}{view.heatLabel ? ` | ${view.heatLabel}` : ""}
      </h2>
      <span
        class="flex w-20 items-center justify-center text-[11px] text-neutral-300"
      >
        {timed ? "Aika" : "Tulos"}
      </span>
    </div>
  </header>

  <ol
    class="flex flex-col gap-0.5 border-(--accent) border-b-2 bg-neutral-950/90 py-0.5"
  >
    {#each visible as { entry, index } (entry.Id)}
      {@const change = view.changes.get(entry.Id)}
      {@const place = places.get(entry.Id) ?? index}
      {@const rank = rankOf(entry, place, inHeat)}
      {@const focused = entry.Id === focusId}
      {@const tag = recordTag(entry, view.eventCategory)}
      {@const q = qualification(entry)}
      {@const gap = focused ? null : rowGap(entry.Result)}
      <!-- The athlete who just competed climbs over the rows they pass. -->
      <li animate:swap in:enter class={cn("relative", focused && "z-20")}>
        <div
          class={cn(
            "flex h-7 items-stretch bg-neutral-800/90 transition-colors duration-700",
            // Text switches at once so it never fades through the background.
            focused &&
              "bg-(--accent) text-black transition-[background-color] duration-300",
            // Running events show their changes as the times come in.
            !focused && !timed && change && "bg-neutral-600 duration-0",
          )}
        >
          <span
            class="flex w-8 shrink-0 items-center justify-center tabular-nums"
          >
            {#if resultsIn && !revealed.has(entry.Id)}
              <Camera
                class="size-3.5 text-neutral-400"
                aria-label="Odottaa maalikameraa"
              />
            {:else if timed && !resultsIn}
              <!-- Start list: the lane. -->
              <span class="text-neutral-400">{entry.Position || ""}</span>
            {:else if q}
              <span
                class={cn(
                  "px-1 text-xs",
                  focused
                    ? "bg-black text-(--accent)"
                    : "bg-(--accent) text-black",
                )}>{q}</span
              >
            {:else}
              {rank ?? ""}
            {/if}
          </span>
          <span class="flex w-7 shrink-0 items-center justify-center">
            {#if athleteBadge(entry)}
              <AthleteBadge {entry} />
            {:else if clubInitials(entry)}
              <span
                class="flex h-5 w-6 items-center justify-center rounded-sm bg-white text-[9px] text-neutral-700"
                >{clubInitials(entry)}</span
              >
            {/if}
          </span>
          <span
            class="relative flex min-w-0 flex-1 items-center gap-1.5 pl-1.5"
          >
            {#if banners.get(entry.Id)}
              <span
                transition:fade={{ duration }}
                class="absolute inset-0 z-10 flex items-center justify-center bg-(--accent) text-black text-xs"
              >
                {banners.get(entry.Id) === "PB" ? "Ennätys" : "Kauden paras"}
              </span>
            {/if}
            <span class="truncate"
              >{entry.Surname || entry.Name}
              <ActiveAttempt
                active={view.activeAllocationIds.has(entry.AllocId)}
              /></span
            >
            {#if tag}
              <span
                class={cn(
                  "px-1 text-[10px]",
                  focused
                    ? "bg-black text-(--accent)"
                    : "bg-(--accent) text-black",
                )}
              >
                {tag}
              </span>
            {/if}
            {#if gap}
              <span
                class={cn(
                  "ml-auto shrink-0 pr-2 text-neutral-400 text-xs normal-case tabular-nums",
                  close(entry.Result) && "text-(--accent)",
                )}>{gap}</span
              >
            {/if}
          </span>
          {#if !focused}
            <span
              class="flex w-20 shrink-0 items-center justify-end bg-white/5 px-2 tabular-nums"
            >
              {@render mark(shown(entry))}
            </span>
          {/if}
        </div>

        {#if focused}
          <ol
            data-attempt-details
            transition:slide={{ duration }}
            class="ml-5 grid grid-cols-6 text-black normal-case tabular-nums"
          >
            {#each attemptSlots(entry.Attempts) as attempt, i (i)}
              {@const best = !!attempt.Line1 && attempt.Line1 === entry.Result}
              {@const waiting =
                pending?.id === entry.Id && pending.attempt === i}
              <!-- Vertical jumps show each height with its tries, so a failed
                   height does not read as a cleared one. -->
              {@const tries =
                vertical && !waiting && attempt.Line1 && attempt.Line2}
              <li
                class={cn(
                  "flex h-10 flex-col items-center justify-center bg-neutral-200/95 odd:bg-neutral-100/95",
                  !attempt.Line1 &&
                    !waiting &&
                    "bg-neutral-400/90! odd:bg-neutral-300/90!",
                  best && "bg-(--accent)! text-black",
                  popping?.id === entry.Id &&
                    popping.attempt === i &&
                    "new-attempt",
                )}
              >
                <span class="text-neutral-600 text-xs leading-none"
                  >{tries ? attempt.Line1 : i + 1}</span
                >
                {#if waiting}
                  <span class="waiting flex h-5 items-center gap-0.5">
                    <span></span><span></span><span></span>
                  </span>
                {:else if tries}
                  <span
                    class={cn(
                      "text-sm uppercase leading-tight",
                      !/o/i.test(tries) && "text-red-700",
                    )}
                  >
                    {tries}
                  </span>
                {:else if attempt.Line1}
                  <span
                    class={cn(
                      "text-sm leading-tight",
                      isFoul(attempt.Line1) && "text-red-700",
                    )}
                  >
                    {attempt.Line1}
                  </span>
                {/if}
              </li>
            {/each}
          </ol>
        {/if}
      </li>
    {/each}
  </ol>

  <footer class="mt-0.5 flex items-center gap-2">
    <span class="bg-neutral-950/90 px-2 py-0.5 text-(--accent)">
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

<style>
  /* The newest attempt lifts once instead of carrying a border: it grows a
     little and a soft white glow on top fades out. The glow is its own layer
     so the best-attempt colour cannot hide it. */
  .new-attempt {
    position: relative;
    z-index: 1;
    animation: attempt-pop 500ms ease-in-out;
  }
  .new-attempt::after {
    content: "";
    position: absolute;
    inset: 0;
    background: white;
    opacity: 0;
    pointer-events: none;
    animation: attempt-glow 900ms ease-out;
  }
  @keyframes attempt-pop {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes attempt-glow {
    0% {
      opacity: 0;
    }
    20% {
      opacity: 0.35;
    }
    100% {
      opacity: 0;
    }
  }
  /* Three dots stand in for an attempt that is about to be shown. */
  .waiting > span {
    width: 4px;
    height: 4px;
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
      transform: translateY(-4px);
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .new-attempt,
    .new-attempt::after,
    .waiting > span {
      animation: none;
    }
  }
</style>
