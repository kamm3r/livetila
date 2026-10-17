<script lang="ts">
  // Championship TV style: one compact line per athlete, and the athlete who
  // just competed opens up to show their numbered series. `?top=N` limits the
  // list for big fields; the focused athlete always stays visible.
  import { flip } from "svelte/animate";
  import { slide } from "svelte/transition";
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
  // The latest attempt seen while on air, else the last athlete in the
  // starting order to have competed. Nobody is focused before that.
  const focusId = $derived(
    timed ? null : (view.changes.latest?.id ?? turn?.previous?.Id ?? null),
  );
  const top = $derived(Number(page.url.searchParams.get("top")) || Infinity);
  const visible = $derived(
    view.entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry, index }) => index < top || entry.Id === focusId),
  );

  // Field marks get a unit; times and statuses (DNS, NM) are shown as is.
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
    {#each visible as { entry, index } (entry.Id)}
      {@const change = view.changes.get(entry.Id)}
      {@const rank = rankOf(entry, index, inHeat)}
      {@const focused = entry.Id === focusId}
      {@const tag = recordTag(entry, view.eventCategory)}
      {@const q = qualification(entry)}
      <li
        animate:flip={{ duration }}
        class="border-neutral-950 border-t first:border-t-0"
      >
        <div
          class={cn(
            "flex h-7 items-stretch transition-colors duration-700",
            focused && "bg-cyan-300 text-black",
            !focused && change && "bg-cyan-300/30 duration-0",
          )}
        >
          <span
            class="flex w-7 shrink-0 items-center justify-center tabular-nums"
          >
            {rank ?? ""}
          </span>
          <span class="flex w-7 shrink-0 items-center justify-center">
            <AthleteBadge {entry} />
          </span>
          <span class="flex min-w-0 flex-1 items-center gap-1.5 pl-1">
            <span class="truncate">{entry.Surname || entry.Name}</span>
            {#if focused && change?.gained}
              <span class="text-xs">▲{change.gained}</span>
            {/if}
            {#if tag}
              <span
                class={cn(
                  "px-1 text-[10px]",
                  focused ? "bg-black text-cyan-300" : "bg-cyan-300 text-black",
                )}
              >
                {tag}
              </span>
            {/if}
            {#if q}
              <span class={cn("text-xs", !focused && "text-cyan-300")}>{q}</span
              >
            {/if}
          </span>
          <span
            class={cn(
              "flex w-20 shrink-0 items-center justify-end px-2 tabular-nums",
              focused ? "bg-cyan-200" : "bg-white/10",
            )}
          >
            {@render mark(entry.Result)}
          </span>
        </div>

        {#if focused}
          <ol
            transition:slide={{ duration }}
            class="grid grid-cols-6 bg-neutral-300 text-black normal-case tabular-nums"
          >
            {#each attemptSlots(entry.Attempts) as attempt, i (i)}
              {@const best = !!attempt.Line1 && attempt.Line1 === entry.Result}
              <li
                class={cn(
                  "flex flex-col px-1 pt-0.5 pb-1 odd:bg-neutral-200",
                  !attempt.Line1 && "bg-neutral-100! text-neutral-500",
                  best && "bg-cyan-300! text-black",
                  change?.newAttempt === i &&
                    "outline-2 outline-black -outline-offset-2",
                )}
              >
                <span class="text-[10px] text-neutral-500 leading-none">
                  {i + 1}
                </span>
                <span
                  class={cn(
                    "text-center text-sm leading-tight",
                    isFoul(attempt.Line1) && "text-red-700",
                  )}
                >
                  {attempt.Line1 || " "}
                </span>
                {#if attempt.Line2}
                  <span class="text-center text-[10px] leading-none"
                    >{attempt.Line2}</span
                  >
                {/if}
              </li>
            {/each}
          </ol>
        {/if}
      </li>
    {/each}
  </ol>

  {#if turn?.next && turn.next.Id !== focusId}
    <div
      class="flex h-7 items-center gap-2 border-cyan-300 border-t bg-neutral-950/90 px-2 text-sm"
    >
      <span class="text-[10px] text-cyan-300">Vuorossa</span>
      <AthleteBadge entry={turn.next} />
      <span class="truncate">{turn.next.Surname || turn.next.Name}</span>
    </div>
  {/if}

  <footer class="mt-1 flex items-center gap-2">
    <span class="bg-neutral-950/90 px-2 py-0.5 text-cyan-300">
      {view.competitionName ?? ""}
    </span>
    {#if view.isRefreshError}
      <span
        role="status"
        class="bg-neutral-950/90 px-2 py-0.5 text-xs normal-case text-neutral-300"
      >
        Päivitys viivästyy
      </span>
    {/if}
  </footer>
</div>
