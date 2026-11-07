<script lang="ts">
  import { flip } from "svelte/animate";
  import { prefersReducedMotion } from "svelte/motion";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import * as Empty from "$lib/components/ui/empty";
  import { getRoundContext } from "./round-provider.svelte";
  import {
    eliminatedAfterThree,
    gapToLeader,
    leadingResult,
    recordTag,
    resultCodeLegend,
    sortByResult,
    turnOrder,
    didNotStart,
    withStatusAsResult,
  } from "$lib/results";
  import { createResultChanges } from "$lib/result-changes.svelte";
  import { cn } from "$lib/utils";
  import type { Allocation, EventCategory, TotalResult } from "~/types/comp";
  import { attemptLayout } from "$lib/attempt-layout";
  import { activeAllocationIds } from "$lib/active-attempt";
  import ActiveAttempt from "./active-attempt.svelte";
  import AthleteBadge from "./athlete-badge.svelte";

  type Entry = Allocation | TotalResult;

  const ctx = getRoundContext();
  let {
    eventCategory,
    eventSubCategory,
    isCombinedEvent = false,
    live = false,
    fresh = true,
  }: {
    eventCategory: EventCategory;
    eventSubCategory?: string;
    isCombinedEvent?: boolean;
    live?: boolean;
    // False while refreshes fail: the turn may have moved on since.
    fresh?: boolean;
  } = $props();

  const activeIds = $derived(
    fresh ? activeAllocationIds(ctx.currentRound) : new Set<number>(),
  );

  const sortedAllocs = $derived(
    ctx.currentHeat && ctx.heats.length > 0
      ? ctx.currentHeat.Allocations.map(withStatusAsResult).sort((a, b) =>
          sortByResult(a, b, eventCategory, "HeatRank"),
        )
      : [],
  );

  const sortedTotal = $derived(
    ctx.currentRound?.TotalResults
      ? ctx.currentRound.TotalResults.map(withStatusAsResult).sort((a, b) =>
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
  const vertical = $derived(
    attemptLayout(primary, eventCategory, eventSubCategory, isCombinedEvent)
      .vertical,
  );
  // Attempt-by-attempt follow-up only makes sense for field events in progress.
  const latest = $derived.by(() => {
    if (!live || eventCategory !== "Field" || vertical) return null;
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
  const next = $derived(latest && fresh ? order.next : null);

  // Gold, silver and bronze mark the podium on the rank itself; placing in a
  // heat wins no medal.
  const showMedals = $derived(ctx.currentRound?.RoundTypeCategory === "Final");
  const medals = [
    "bg-amber-300 text-amber-950 dark:bg-amber-400 dark:text-amber-950",
    "bg-slate-300 text-slate-900 dark:bg-slate-300 dark:text-slate-900",
    "bg-[oklch(0.74_0.07_55)] text-orange-950",
  ];
  const moveDuration = $derived(prefersReducedMotion.current ? 0 : 250);

  // The best attempt is the first one matching the official result.
  function bestAttempt(entry: Entry) {
    return entry.Result
      ? (entry.Attempts?.findIndex((a) => a.Line1 === entry.Result) ?? -1)
      : -1;
  }

  const isFoul = (mark: string) => /^[xr]$/i.test(mark.trim());

  // The API writes a pass and negative wind with a hyphen.
  const typeset = (mark: string) =>
    mark === "-" ? "–" : mark.replace(/^-/, "−");

  // The leader has no gap to show.
  function shownGap(entry: Entry, leader: ReturnType<typeof leadingResult>) {
    const gap = gapToLeader(entry.Result, leader, eventCategory);
    return gap && gap !== "—" ? gap : "";
  }

  // Rows with attempts have a header naming the gap from tablet width; other
  // lists have none until the table.
  const gapHeaderAtTablet = $derived.by(() => {
    const columns = attemptLayout(
      primary,
      eventCategory,
      eventSubCategory,
      isCombinedEvent,
    ).labels.length;
    return columns > 0 && columns <= 8;
  });
  const showsGap = $derived(
    [sortedAllocs, showTotal ? sortedTotal : []].some((list) => {
      const leader = leadingResult(list, eventCategory);
      return list.some((entry) => {
        const gap = gapToLeader(entry.Result, leader, eventCategory);
        return gap && gap !== "—";
      });
    }),
  );

  // Once under everything on the page, explaining only what is on the page.
  const legend = $derived.by(() => {
    const entries = [...sortedAllocs, ...(showTotal ? sortedTotal : [])];
    const marks = entries.flatMap((entry) =>
      (entry.Attempts ?? []).map((attempt) =>
        vertical ? attempt.Line2 : attempt.Line1,
      ),
    );
    const tags = entries.map((entry) => recordTag(entry, eventCategory));
    const eliminated =
      !vertical &&
      eliminatedAfterThree(sortedAllocs).size +
        eliminatedAfterThree(sortedTotal).size >
        0;
    return [
      vertical && marks.some((mark) => /o/i.test(mark)) && "o = onnistunut",
      marks.some((mark) => /x/i.test(mark)) && "x = hylätty",
      marks.some((mark) => /[–-]/.test(mark)) && "– = ei suoritusta",
      eliminated && "viivoitus = karsiutui 3. kierroksen jälkeen",
      ...resultCodeLegend(entries),
      tags.includes("PB") && "PB = ennätys",
      tags.includes("SB") && "SB = kauden paras",
    ].filter((item) => typeof item === "string");
  });
</script>

{#snippet rankMark(rank: number | undefined, muted: boolean)}
  <span
    class={cn(
      "inline-flex size-6 items-center justify-center rounded-full font-semibold text-ui tabular-nums",
      showMedals && rank && rank <= 3 && medals[rank - 1],
      muted && "text-muted-foreground",
    )}>{rank || "–"}</span
  >
{/snippet}

{#snippet gainedPlaces(gained: number)}
  <span class="font-semibold text-2xs text-green-700 dark:text-green-400"
    ><span aria-hidden="true">▲{gained}</span><span class="sr-only"
      >Noussut {gained} sijaa</span
    ></span
  >
{/snippet}

{#snippet result(entry: Entry, large: boolean)}
  {@const tag = recordTag(entry, eventCategory)}
  <!-- The tag keeps a fixed slot so every result ends at the same edge. -->
  <span class="inline-grid grid-cols-[1fr_20px] items-start">
    <span
      class={cn(
        "text-right font-semibold tabular-nums",
        "text-base",
        large && "leading-5",
      )}>{entry.Result ? typeset(entry.Result) : "–"}</span
    >
    <span
      class={cn(
        "pt-[3px] pl-[3px] text-left font-semibold text-2xs uppercase leading-none",
        tag === "PB" && "font-bold text-emerald-700 dark:text-emerald-400",
        tag === "SB" && "font-bold text-sky-700 dark:text-sky-400",
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
  height?: string,
)}
  {@const index =
    height === undefined
      ? i
      : (entry.Attempts?.findIndex((attempt) => attempt.Line1 === height) ??
        -1)}
  {@const attempt = entry.Attempts?.[index]}
  {#if attempt?.Line1}
    <span
      data-best={index === best ? "" : undefined}
      class={cn(
        "inline-flex flex-col items-center rounded-md px-1.5 py-0.5",
        index === best && "font-semibold text-primary",
        isFoul(attempt.Line1) && "text-muted-foreground",
        attempt.Line1 === "–" || attempt.Line1 === "-"
          ? "text-muted-foreground"
          : "",
        index === newAttempt && "ring-1 ring-yellow-400",
      )}
    >
      <span>{typeset(height ? attempt.Line2 || "–" : attempt.Line1)}</span>
      {#if !height && attempt.Line2}<span
          class="font-normal text-2xs text-muted-foreground"
          >{typeset(attempt.Line2)}</span
        >{/if}
    </span>
  {:else}
    <span class="sr-only">Ei suoritusta</span>
  {/if}
{/snippet}

{#snippet resultList(
  entries: Entry[],
  rankKey: "HeatRank" | "ResultRank",
  changes: ReturnType<typeof createResultChanges>,
)}
  {@const layout = attemptLayout(
    entries,
    eventCategory,
    eventSubCategory,
    isCombinedEvent,
  )}
  {@const columns = layout.labels.length}
  {@const leader = leadingResult(entries, eventCategory)}
  {@const out = layout.vertical
    ? new Set<number>()
    : eliminatedAfterThree(entries)}
  <!-- Padding to six slots must not mark the sixth attempt as active. -->
  {@const activeIndex = ctx.currentHeat?.ActiveAllocationAttemptIndex ?? -1}
  {@const currentRound =
    live && !layout.vertical
      ? Math.min(
          columns,
          activeIndex >= 0 && activeIds.size > 0
            ? activeIndex + 1
            : Math.max(
                0,
                ...entries.map(
                  (entry) =>
                    entry.Attempts?.filter((attempt) => attempt.Line1).length ??
                    0,
                ),
              ),
        )
      : 0}
  <div class="data-frame hidden overflow-x-auto xl:block">
    <!-- Fixed columns line up stacked tables; names and clubs share the rest. -->
    <table
      class="w-full table-fixed text-sm"
      style={`min-width: ${columns > 0 ? 688 + columns * 58 : 724}px`}
    >
      <thead>
        <tr class="data-head">
          <th class="w-16 pl-3 text-left font-medium" scope="col">Sija</th>
          <th class="w-11" scope="col"
            ><span class="sr-only">Seuran logo</span></th
          >
          <th class="px-2 text-left font-medium" scope="col">Urheilija</th>
          <th
            class={cn("px-2 text-left font-medium", columns > 0 && "w-56")}
            scope="col">Seura</th
          >
          {#each { length: columns }, i (i)}
            <th
              class={cn(
                "w-[58px] text-center font-medium",
                i + 1 === currentRound &&
                  "font-bold text-primary underline decoration-primary/60 decoration-2 underline-offset-4",
              )}
              scope="col"
              >{layout.labels[i]}{#if i + 1 === currentRound}<span
                  class="sr-only"
                >
                  (meneillään)</span
                >{/if}</th
            >
          {/each}
          <th class="w-24 pr-5 text-right font-medium" scope="col">Tulos</th>
          <th class="w-20 pr-4 text-right font-medium" scope="col">Ero</th>
        </tr>
      </thead>
      <tbody>
        {#each entries as entry (entry.Id)}
          {@const change = changes.get(entry.Id)}
          {@const best = bestAttempt(entry)}
          {@const rank = entry[rankKey]}
          {@const isOut = !didNotStart(entry) && out.has(entry.Id)}
          <tr
            animate:flip={{ duration: moveDuration }}
            data-changed={change ? "" : undefined}
            class={cn(
              "h-12 border-t transition-colors duration-1000 first:border-t-0",
              isOut &&
                "text-muted-foreground [&_[data-best]]:text-inherit [&_img]:opacity-80",
              change && "bg-yellow-100 duration-0 dark:bg-yellow-400/10",
            )}
          >
            <td class="pt-0.5 pl-3">
              <span class="grid grid-cols-[24px_22px] items-center gap-1">
                {@render rankMark(rank, isOut)}
                <span>
                  {#if change?.gained}{@render gainedPlaces(change.gained)}{/if}
                </span>
              </span>
            </td>
            <td class="px-1"><AthleteBadge {entry} /></td>
            <td class="px-2">
              <!-- Names wrap rather than truncate; the bib stays with the surname. -->
              <span class="block py-1.5 leading-5">
                <span class="font-medium">{entry.Name}</span>
                {#if entry.Number}<span
                    class="ml-1 whitespace-nowrap text-muted-foreground text-xs tabular-nums"
                    >#{entry.Number}</span
                  >{/if}
                <span class="text-primary"
                  ><ActiveAttempt
                    active={activeIds.has(entry.AllocId)}
                    labelled
                  /></span
                >
              </span>
            </td>
            <td
              class="truncate pt-0.5 pr-4 pl-2 text-ui leading-5 text-muted-foreground"
              title={entry.Organization?.Name}
            >
              {entry.Organization?.Name ?? "-"}
            </td>
            {#each { length: columns }, i (i)}
              {#if isOut && i >= 3}
                <td class="hatch"><span class="sr-only">Karsiutui</span></td>
              {:else}
                <td class="text-center text-ui tabular-nums">
                  {@render attemptMark(
                    entry,
                    i,
                    best,
                    change?.newAttempt,
                    layout.vertical ? layout.labels[i] : undefined,
                  )}
                </td>
              {/if}
            {/each}
            <td class="text-right">{@render result(entry, false)}</td>
            <td
              class="pt-0.5 pr-4 text-right text-ui leading-5 text-muted-foreground tabular-nums"
            >
              {shownGap(entry, leader)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- One sticky label row while the attempts fit a card's width; more heights
       than that wrap, so each mark keeps its own label. -->
  <!-- Heights are values to read, not a count, so each card names its own. -->
  {@const fitsRow = columns > 0 && columns <= 8}
  {@const sharedLabels = fitsRow && !layout.vertical}
  <!-- Heights keep a fixed width, so a few never spread across the card. -->
  {@const attemptGrid = fitsRow
    ? `grid-template-columns: repeat(${columns}, minmax(0, ${layout.vertical ? "3.25rem" : "1fr"}))`
    : undefined}
  <!-- From tablet width a row fits on one line: name, attempts, result. -->
  <ul
    class="data-frame overflow-clip xl:hidden"
    style={`--attempts: ${columns * (layout.vertical ? 52 : 44)}px`}
  >
    {#if fitsRow}
      <li
        aria-hidden="true"
        class:max-md:hidden={!sharedLabels}
        class="data-head sticky top-0 z-10 grid items-center gap-x-2.5 border-b-0 bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))] px-3 text-center md:grid-cols-[24px_24px_minmax(0,1fr)_var(--attempts)_6rem]"
      >
        <span class="hidden text-left md:col-span-2 md:block">Sija</span>
        <span class="hidden text-left md:col-start-3 md:block">Urheilija</span>
        <span class="grid md:col-start-4" style={attemptGrid}>
          {#each layout.labels as label, i (label)}
            <span
              class={cn(
                i + 1 === currentRound &&
                  "font-bold text-primary underline decoration-primary/60 decoration-2 underline-offset-4",
              )}>{label}</span
            >
          {/each}
        </span>
        <span class="hidden whitespace-nowrap pr-5 text-right md:block"
          >Tulos / Ero</span
        >
      </li>
    {/if}
    {#each entries as entry (entry.Id)}
      {@const change = changes.get(entry.Id)}
      {@const best = bestAttempt(entry)}
      {@const rank = entry[rankKey]}
      {@const gap = gapToLeader(entry.Result, leader, eventCategory)}
      {@const isOut = !didNotStart(entry) && out.has(entry.Id)}
      <li
        animate:flip={{ duration: moveDuration }}
        data-changed={change ? "" : undefined}
        class={cn(
          "grid grid-cols-[24px_24px_minmax(0,1fr)_auto] gap-x-2.5 border-t px-3 py-2 transition-colors duration-1000 first:border-t-0",
          fitsRow &&
            "md:grid-cols-[24px_24px_minmax(0,1fr)_var(--attempts)_6rem] md:items-center",
          // With no attempts a row is two lines, laid out like the start list.
          columns === 0 && "items-center",
          isOut &&
            "text-muted-foreground [&_[data-best]]:text-inherit [&_img]:opacity-80",
          change && "bg-yellow-100 duration-0 dark:bg-yellow-400/10",
        )}
      >
        <div
          class={cn(
            "flex flex-col items-center leading-tight",
            columns > 0 && "-mt-0.5 md:mt-0",
          )}
        >
          {@render rankMark(rank, isOut)}
          {#if change?.gained}{@render gainedPlaces(change.gained)}{/if}
        </div>
        <div><AthleteBadge {entry} /></div>
        <div class="min-w-0">
          <p class="wrap-break-word text-sm leading-5">
            <span class="font-medium">{entry.Name}</span>
            {#if entry.Number}<span
                class="ml-0.5 text-2xs text-muted-foreground tabular-nums"
                >#{entry.Number}</span
              >{/if}
            <span class="ml-0.5 text-primary"
              ><ActiveAttempt
                active={activeIds.has(entry.AllocId)}
                labelled
              /></span
            >
          </p>
          <p class="truncate text-muted-foreground text-xs leading-4">
            {entry.Organization?.Name ?? "-"}
          </p>
        </div>
        {#if columns > 0 && !didNotStart(entry)}
          <!-- Fixed columns keep attempt N aligned across rows. -->
          <ul
            class={cn(
              "col-span-full row-start-2 mt-1.5 grid text-center text-xs tabular-nums",
              fitsRow
                ? "md:col-span-1 md:col-start-4 md:row-start-1 md:mt-0 md:self-stretch md:items-center"
                : "grid-cols-[repeat(auto-fill,44px)]",
              sharedLabels ? "items-center" : "items-start",
            )}
            style={attemptGrid}
          >
            {#each { length: isOut ? 3 : sharedLabels || !layout.vertical ? columns : layout.labels.findLastIndex( (label) => entry.Attempts?.some((attempt) => attempt.Line1 === label) ) + 1 }, i (i)}
              <li>
                <span
                  class={cn(
                    sharedLabels
                      ? "sr-only"
                      : "block text-2xs text-muted-foreground",
                    !sharedLabels && fitsRow && "md:sr-only",
                  )}>{layout.labels[i]}</span
                >
                {@render attemptMark(
                  entry,
                  i,
                  best,
                  change?.newAttempt,
                  layout.vertical ? layout.labels[i] : undefined,
                )}
              </li>
            {/each}
            {#if isOut && columns > 3}
              <li
                class="hatch h-5 rounded-[3px] md:-my-2 md:h-auto md:self-stretch md:rounded-none"
                style={`grid-column: span ${columns - 3}`}
              >
                <span class="sr-only">Karsiutui</span>
              </li>
            {/if}
          </ul>
        {/if}
        <div
          class={cn(
            "col-start-4 row-start-1 flex flex-col items-end self-start leading-tight",
            fitsRow && "md:col-start-5",
          )}
        >
          {@render result(entry, true)}
          {#if gap && gap !== "—"}
            <span
              class="pr-5 text-muted-foreground text-xs leading-4 tabular-nums"
              >{gap}</span
            >
          {/if}
        </div>
      </li>
    {/each}
  </ul>
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
        size="sm"
        spacing={1}
        class="gap-0.5 rounded-lg bg-muted p-[3px]"
      >
        {#each [...ctx.heats].sort((a, b) => a.Index - b.Index) as heat (heat.Index)}
          <ToggleGroup.Item
            value={String(heat.Index)}
            class="rounded-md px-3 text-ui text-muted-foreground hover:bg-transparent data-[state=on]:bg-card data-[state=on]:text-primary data-[state=on]:shadow-xs"
          >
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
      class="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl border bg-card px-3.5 py-2.5 text-ui shadow-xs"
    >
      <span class="font-medium text-xs text-muted-foreground max-sm:w-[4.5rem]"
        ><span class="sm:hidden">Viimeisin</span><span class="hidden sm:inline"
          >Viimeisin suoritus</span
        ></span
      >
      <span class="font-semibold">{latest.entry.Name}</span>
      <span class="hidden text-muted-foreground sm:inline"
        >{latest.attempt + 1}. suoritus</span
      >
      <span class="font-semibold text-base tabular-nums max-sm:ml-auto"
        >{latest.mark}</span
      >
      {#if latest.gained && latestRank}
        <span
          class="rounded-full bg-green-100 px-2 py-0.5 font-bold text-2xs text-green-700 dark:bg-green-400/15 dark:text-green-300"
          >▲ sijalle {latestRank}</span
        >
      {/if}
      {#if next}
        <span
          class="flex min-w-0 items-center gap-2.5 sm:gap-1.5 max-sm:basis-full sm:ml-auto sm:border-l sm:pl-3"
        >
          <span
            class="shrink-0 font-medium text-xs text-muted-foreground max-sm:w-[4.5rem]"
            >Vuorossa</span
          >
          <span class="truncate font-semibold">{next.Name}</span>
        </span>
      {/if}
    </div>
  {/if}

  {#if sortedAllocs.length > 0}
    <div>{@render resultList(sortedAllocs, "HeatRank", heatChanges)}</div>
  {:else if !showTotal}
    <Empty.Root class="data-frame py-12">
      <Empty.Description>Tuloksia ei ole vielä.</Empty.Description>
    </Empty.Root>
  {/if}

  {#if showTotal}
    <h3 class="mt-3 -mb-1.5 scroll-m-20 font-semibold text-base tracking-tight">
      Kokonaistulokset
    </h3>
    <div>{@render resultList(sortedTotal, "ResultRank", totalChanges)}</div>
  {/if}

  {#if legend.length > 0}
    <ul class="flex flex-wrap gap-x-3.5 gap-y-1 text-muted-foreground text-xs">
      {#each legend as item (item)}
        {@const [key, meaning] = item.split(" = ")}
        <li>
          <span class="font-medium text-foreground/75">{key}</span> = {meaning}
        </li>
      {/each}
      {#if showsGap}
        <li class={gapHeaderAtTablet ? "md:hidden" : "xl:hidden"}>
          <span class="font-medium text-foreground/75">Ero</span> = ero kärkeen
        </li>
      {/if}
    </ul>
  {/if}
</div>
