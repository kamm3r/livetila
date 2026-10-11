<script lang="ts">
  import { flip } from "svelte/animate";
  import { prefersReducedMotion } from "svelte/motion";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import * as Empty from "$lib/components/ui/empty";
  import { getRoundContext } from "./round-provider.svelte";
  import {
    gapToLeader,
    recordTag,
    sortByResult,
    turnOrder,
  } from "$lib/results";
  import { createResultChanges } from "$lib/result-changes.svelte";
  import { cn } from "$lib/utils";
  import type { Allocation, TotalResult } from "~/types/comp";
  import AthleteBadge from "./athlete-badge.svelte";

  type Entry = Allocation | TotalResult;
  type Category = "Track" | "Field" | "Relay";

  const ctx = getRoundContext();
  let {
    eventCategory,
    live = false,
  }: { eventCategory: Category; live?: boolean } = $props();

  const sortedAllocs = $derived(
    ctx.currentHeat && ctx.heats.length > 0
      ? [...ctx.currentHeat.Allocations].sort((a, b) =>
          sortByResult(a, b, eventCategory, "HeatRank"),
        )
      : [],
  );

  const sortedTotal = $derived(
    ctx.currentRound?.TotalResults
      ? [...ctx.currentRound.TotalResults].sort((a, b) =>
          sortByResult(a, b, eventCategory),
        )
      : [],
  );
  const showTotal = $derived(
    sortedTotal.length > 0 &&
      (ctx.heats.length > 1 || sortedAllocs.length === 0),
  );

  const heatChanges = createResultChanges(() => sortedAllocs);
  const totalChanges = createResultChanges(() => sortedTotal);

  // The latest-attempt bar follows the list shown first.
  const primary = $derived(
    sortedAllocs.length > 0 ? sortedAllocs : sortedTotal,
  );
  const primaryChanges = $derived(
    sortedAllocs.length > 0 ? heatChanges : totalChanges,
  );
  const primaryRankKey: "HeatRank" | "ResultRank" = $derived(
    sortedAllocs.length > 0 ? "HeatRank" : "ResultRank",
  );
  const order = $derived(turnOrder(primary));
  const latest = $derived.by(() => {
    const seen = primaryChanges.latest;
    const entry = seen
      ? primary.find((item) => item.Id === seen.id)
      : order.previous;
    if (!entry?.Attempts?.length) return null;
    const attempt = seen ? seen.attempt : entry.Attempts.length - 1;
    const mark = entry.Attempts[attempt]?.Line1;
    if (!mark) return null;
    return { entry, attempt, mark, gained: seen?.gained ?? 0 };
  });
  const next = $derived(live ? order.next : null);

  const medal = ["#f59e0b", "#9ca3af", "#c2410c"];
  const moveDuration = $derived(prefersReducedMotion.current ? 0 : 250);
  const isField = $derived(eventCategory === "Field");

  function attemptColumns(entries: Entry[]) {
    return Math.max(0, ...entries.map((entry) => entry.Attempts?.length ?? 0));
  }

  // The best attempt is the first one matching the official result.
  function bestAttempt(entry: Entry) {
    return entry.Result
      ? (entry.Attempts?.findIndex((a) => a.Line1 === entry.Result) ?? -1)
      : -1;
  }

  function medalBar(rank: number | undefined) {
    return rank && rank <= 3
      ? `box-shadow: inset 3px 0 0 ${medal[rank - 1]}`
      : undefined;
  }

  const isFoul = (mark: string) => /^[xr]$/i.test(mark.trim());
</script>

{#snippet gainedPlaces(gained: number)}
  <span class="font-bold text-[10px] text-green-700 dark:text-green-400"
    ><span aria-hidden="true">▲{gained}</span><span class="sr-only"
      >Noussut {gained} sijaa</span
    ></span
  >
{/snippet}

{#snippet result(entry: Entry, large: boolean)}
  {@const tag = recordTag(entry, eventCategory)}
  <!-- The tag keeps a fixed slot so every result ends at the same edge. -->
  <span class="inline-grid grid-cols-[1fr_18px] items-start">
    <span
      class={cn(
        "text-right font-bold tabular-nums",
        large ? "text-[17px]" : "text-base",
      )}>{entry.Result || "-"}</span
    >
    <span
      class={cn(
        "pt-0.5 pl-[3px] text-left font-bold text-[9px] uppercase leading-none",
        tag === "PB" && "text-green-700 dark:text-green-400",
        tag === "SB" && "text-blue-700 dark:text-blue-400",
      )}
      >{#if tag}<span aria-hidden="true">{tag}</span><span class="sr-only"
          >{tag === "PB" ? "Ennätys" : "Kauden paras"}</span
        >{/if}</span
    >
  </span>
{/snippet}

{#snippet attemptMark(
  entry: Entry,
  i: number,
  best: number,
  newAttempt: number | undefined,
)}
  {@const attempt = entry.Attempts?.[i]}
  {#if attempt?.Line1}
    <span
      class={cn(
        "inline-flex flex-col rounded px-1",
        i === best && "font-bold text-primary",
        isFoul(attempt.Line1) && "text-muted-foreground/70",
        attempt.Line1 === "–" || attempt.Line1 === "-"
          ? "text-muted-foreground"
          : "",
        i === newAttempt && "ring-1 ring-yellow-400",
      )}
    >
      <span>{attempt.Line1}</span>
      {#if attempt.Line2}<span class="text-[10px] text-muted-foreground"
          >{attempt.Line2}</span
        >{/if}
    </span>
  {/if}
{/snippet}

{#snippet resultList(
  entries: Entry[],
  rankKey: "HeatRank" | "ResultRank",
  changes: ReturnType<typeof createResultChanges>,
)}
  {@const columns = attemptColumns(entries)}
  {@const leader = entries[0]?.Result ?? null}
  <div class="hidden overflow-x-auto rounded-lg border lg:block">
    <table class="w-full text-sm">
      <thead class="bg-muted">
        <tr
          class="h-[34px] text-[10px] text-muted-foreground uppercase tracking-[0.06em]"
        >
          <th class="w-14 pr-2 text-right font-medium" scope="col">Sija</th>
          <th class="w-10" scope="col"
            ><span class="sr-only">Seuran logo</span></th
          >
          <th class="px-2 text-left font-medium" scope="col">Urheilija</th>
          <th class="px-2 text-left font-medium" scope="col">Seura</th>
          {#each { length: columns }, i (i)}
            <th class="w-[58px] text-center font-medium" scope="col">{i + 1}</th
            >
          {/each}
          <th class="w-24 pr-[18px] text-right font-medium" scope="col"
            >Tulos</th
          >
          <th class="w-16 pr-4 text-right font-medium" scope="col">Ero</th>
        </tr>
      </thead>
      <tbody>
        {#each entries as entry, index (entry.Id)}
          {@const change = changes.get(entry.Id)}
          {@const best = bestAttempt(entry)}
          {@const rank = entry[rankKey]}
          <tr
            animate:flip={{ duration: moveDuration }}
            data-changed={change ? "" : undefined}
            class={cn(
              "h-[46px] transition-colors duration-1000",
              index % 2 === 1 && "bg-muted/45",
              change && "bg-yellow-100 duration-0 dark:bg-yellow-400/10",
            )}
          >
            <td class="pr-2" style={medalBar(rank)}>
              <span class="grid grid-cols-[1fr_22px] items-center gap-1">
                <span class="text-right font-bold text-[15px] tabular-nums"
                  >{rank || "-"}</span
                >
                <span>
                  {#if change?.gained}{@render gainedPlaces(change.gained)}{/if}
                </span>
              </span>
            </td>
            <td class="px-1"><AthleteBadge {entry} kind="club" /></td>
            <td class="px-2">
              <span class="flex items-center gap-2 whitespace-nowrap">
                <AthleteBadge {entry} kind="flag" />
                <span class="font-semibold">{entry.Name}</span>
                {#if entry.Number}<span
                    class="text-muted-foreground text-xs tabular-nums"
                    >#{entry.Number}</span
                  >{/if}
              </span>
            </td>
            <td
              class="max-w-56 truncate px-2 text-[13px] text-muted-foreground"
            >
              {entry.Organization?.Name ?? "-"}
            </td>
            {#each { length: columns }, i (i)}
              <td class="text-center text-[13px] tabular-nums">
                {@render attemptMark(entry, i, best, change?.newAttempt)}
              </td>
            {/each}
            <td class="text-right">{@render result(entry, false)}</td>
            <td
              class="pr-4 text-right text-[13px] text-muted-foreground tabular-nums"
            >
              {gapToLeader(entry.Result, leader, eventCategory) ?? ""}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <ul class="overflow-hidden rounded-lg border lg:hidden">
    {#each entries as entry, index (entry.Id)}
      {@const change = changes.get(entry.Id)}
      {@const best = bestAttempt(entry)}
      {@const rank = entry[rankKey]}
      {@const gap = gapToLeader(entry.Result, leader, eventCategory)}
      <li
        animate:flip={{ duration: moveDuration }}
        data-changed={change ? "" : undefined}
        style={medalBar(rank)}
        class={cn(
          "grid grid-cols-[24px_24px_minmax(0,1fr)_auto] gap-x-2.5 px-3 py-2 transition-colors duration-1000",
          index % 2 === 1 && "bg-muted/45",
          change && "bg-yellow-100 duration-0 dark:bg-yellow-400/10",
        )}
      >
        <div class="flex flex-col items-center leading-tight">
          <span class="font-bold text-[15px] tabular-nums">{rank || "-"}</span>
          {#if change?.gained}{@render gainedPlaces(change.gained)}{/if}
        </div>
        <div class="pt-0.5"><AthleteBadge {entry} kind="club" /></div>
        <div class="min-w-0">
          <div class="flex min-w-0 items-baseline gap-1.5">
            <AthleteBadge {entry} kind="flag" />
            <span class="truncate font-semibold text-sm">{entry.Name}</span>
            {#if entry.Number}<span
                class="shrink-0 text-[11px] text-muted-foreground tabular-nums"
                >#{entry.Number}</span
              >{/if}
          </div>
          <p class="truncate text-muted-foreground text-xs">
            {entry.Organization?.Name ?? "-"}
          </p>
          {#if columns > 0}
            <!-- Fixed columns keep attempt N aligned across rows. -->
            <ul
              class="mt-1 grid grid-cols-[repeat(auto-fill,34px)] gap-x-1 text-xs tabular-nums"
            >
              {#each { length: columns }, i (i)}
                <li>
                  {#if entry.Attempts?.[i]?.Line1}
                    {@render attemptMark(entry, i, best, change?.newAttempt)}
                  {:else}
                    <span class="px-1 text-muted-foreground" aria-hidden="true"
                      >·</span
                    ><span class="sr-only">Ei suoritusta</span>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
        <div class="flex flex-col items-end leading-tight">
          {@render result(entry, true)}
          {#if gap && gap !== "—"}
            <span
              class="mt-0.5 pr-[18px] text-[11px] text-muted-foreground tabular-nums"
              >{gap}</span
            >
          {/if}
        </div>
      </li>
    {/each}
  </ul>
  <p class="mt-2 text-[11px] text-muted-foreground">
    {[
      isField && columns > 0 ? "x = hylätty · – = ei suoritusta" : null,
      "PB = ennätys · SB = kauden paras · Ero = ero kärkeen",
    ]
      .filter(Boolean)
      .join(" · ")}
  </p>
{/snippet}

<div class="flex flex-col gap-4">
  {#if ctx.showHeatNumbers && ctx.heats.length > 0}
    <div
      class="flex overflow-x-auto flex-nowrap gap-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      <ToggleGroup.Root
        type="single"
        value={String(ctx.selectedHeat)}
        onValueChange={(v) => ctx.handleHeatChange(Number(v))}
        variant="outline"
        size="sm"
      >
        {#each [...ctx.heats].sort((a, b) => a.Index - b.Index) as heat (heat.Index)}
          <ToggleGroup.Item value={String(heat.Index)}>
            Erä {heat.Index}
          </ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </div>
  {/if}

  {#if latest}
    {@const latestRank = latest.entry[primaryRankKey]}
    <!-- Wraps to two lines on narrow screens so long names never truncate. -->
    <div
      role="status"
      class="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-[13px] dark:border-yellow-400/25 dark:bg-yellow-400/10"
    >
      <span
        class="size-2 shrink-0 rounded-full bg-yellow-400"
        aria-hidden="true"
      ></span>
      <span
        class="font-semibold text-[11px] text-yellow-700 uppercase tracking-[0.06em] dark:text-yellow-400"
        ><span class="sm:hidden">Viimeisin</span><span class="hidden sm:inline"
          >Viimeisin suoritus</span
        ></span
      >
      <span class="font-semibold">{latest.entry.Name}</span>
      <span class="hidden text-muted-foreground sm:inline"
        >{latest.attempt + 1}. suoritus</span
      >
      <span class="font-bold text-[15px] tabular-nums">{latest.mark}</span>
      {#if latest.gained && latestRank}
        <span
          class="rounded-full bg-green-100 px-2 py-0.5 font-bold text-[11px] text-green-700 dark:bg-green-400/15 dark:text-green-300"
          >▲ sijalle {latestRank}</span
        >
      {/if}
      {#if next}
        <span
          class="flex min-w-0 items-center gap-1.5 max-sm:basis-full max-sm:pl-4.5 sm:ml-auto sm:border-l sm:border-yellow-200 sm:pl-3 dark:sm:border-yellow-400/25"
        >
          <span
            class="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.06em] sm:text-[11px]"
            >Seuraavana</span
          >
          <span class="truncate font-semibold">{next.Name}</span>
          {#if next.Number}<span
              class="text-muted-foreground text-xs tabular-nums"
              >#{next.Number}</span
            >{/if}
        </span>
      {/if}
    </div>
  {/if}

  {#if sortedAllocs.length > 0}
    <div>{@render resultList(sortedAllocs, "HeatRank", heatChanges)}</div>
  {:else if !showTotal}
    <Empty.Root>
      <Empty.Description>Tuloksia ei ole saatavilla vielä...</Empty.Description>
    </Empty.Root>
  {/if}

  {#if showTotal}
    <h3 class="mt-2 scroll-m-20 font-semibold text-xl tracking-tight">
      Kokonaistulokset
    </h3>
    <div>{@render resultList(sortedTotal, "ResultRank", totalChanges)}</div>
  {/if}
</div>
