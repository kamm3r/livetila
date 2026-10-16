<script lang="ts">
  import { selectOverlayRound } from "$lib/competition-selection";
  import { flip } from "svelte/animate";
  import { prefersReducedMotion } from "svelte/motion";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    competitionQueries,
    createCompetitionData,
  } from "$lib/competition-data.svelte";
  import { flattenEvents } from "$lib/events";
  import { isTimed, sortByResult } from "$lib/results";
  import { cn } from "$lib/utils";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import AthleteBadge from "$lib/components/athlete-badge.svelte";
  import { createResultChanges } from "$lib/result-changes.svelte";
  import {
    parseOverlayStyle,
    type OverlayView,
  } from "$lib/components/overlay/overlay";
  import Tower from "$lib/components/overlay/tower.svelte";
  import Ticker from "$lib/components/overlay/ticker.svelte";
  import Spotlight from "$lib/components/overlay/spotlight.svelte";
  import ClassicPlus from "$lib/components/overlay/classic-plus.svelte";
  import ClassicInline from "$lib/components/overlay/classic-inline.svelte";
  import ClassicFocus from "$lib/components/overlay/classic-focus.svelte";
  import Broadcast from "$lib/components/overlay/broadcast.svelte";
  import BroadcastPinned from "$lib/components/overlay/broadcast-pinned.svelte";
  import BroadcastBoard from "$lib/components/overlay/broadcast-board.svelte";
  import BroadcastFrame from "$lib/components/overlay/broadcast-frame.svelte";
  import BroadcastResults from "$lib/components/overlay/broadcast-results.svelte";
  import Timetable from "$lib/components/overlay/timetable.svelte";

  type Attempt = {
    Line1?: string | null;
    Line2?: string | null;
  };

  const slug = $derived(page.params.slug ?? "");
  const data = createCompetitionData(() => slug, "overlay");
  const selectedHeat = $derived(page.url.searchParams.get("heat"));
  const competition = $derived(data.competition);
  const compDetails = $derived(data.details);
  // Only the timetable needs the competition's events.
  const style = $derived(parseOverlayStyle(page.url.searchParams.get("style")));
  const timetableEvents = createQuery(() =>
    competitionQueries.events(
      style === "timetable" ? data.identity?.competitionId : undefined,
      true,
    ),
  );
  const isLoading = $derived(data.isLoading);
  const isError = $derived(data.isError);

  const eventCategory = $derived(competition?.EventCategory ?? "Field");
  const isTrack = $derived(isTimed(eventCategory));

  const selection = $derived(
    selectOverlayRound(competition?.Rounds ?? [], page.url.searchParams),
  );
  const rounds = $derived(selection.round);
  const heats = $derived(rounds?.Heats ?? []);
  const heatExists = $derived(Boolean(selection.heat));
  const allocations = $derived(
    selection.allocations
      .slice()
      .sort((a, b) =>
        sortByResult(
          a,
          b,
          eventCategory,
          selectedHeat ? "HeatRank" : "ResultRank",
        ),
      ),
  );

  const frameVariant = (value: string) =>
    (
      [
        "context",
        "gap",
        "swap",
        "detail",
        "quiet",
        "trail",
        "stacked",
        "quiet-2",
        "trail-2",
        "stacked-2",
        "trail-stack",
        "trail-inline",
        "trail-plain",
      ] as const
    ).find((variant) => value === `broadcast-${variant}`) ?? "refined";
  const changes = createResultChanges(() => allocations);
  const view: OverlayView = $derived({
    entries: allocations,
    eventCategory,
    eventName: competition?.Name,
    roundName: rounds?.Name,
    competitionName: compDetails?.Competition?.Name,
    heatLabel:
      selectedHeat && heats.length > 1
        ? `Erä ${selectedHeat}/${heats.length}`
        : undefined,
    wind: isTrack ? selection.heat?.Wind || undefined : undefined,
    isLoading,
    isRefreshError: data.isRefreshError,
    changes,
  });

  const MAX_ATTEMPTS = 6;

  function isAttempt(value: unknown): value is Attempt {
    return typeof value === "object" && value !== null;
  }

  function normalizeAttempts(attempts: unknown): Attempt[] {
    if (!Array.isArray(attempts)) return [];

    const validAttempts = attempts.filter(isAttempt);

    if (validAttempts.length <= MAX_ATTEMPTS) {
      return validAttempts;
    }

    return validAttempts.slice(-MAX_ATTEMPTS);
  }
</script>

{#if !data.identity}
  <p class="bg-black/90 p-2 text-cyan-300">Virheellinen linkki</p>
{:else if style === "timetable"}
  <Timetable
    events={flattenEvents(timetableEvents.data ?? {})}
    competitionName={compDetails?.Competition?.Name}
  />
{:else if rounds && selectedHeat && !heatExists}
  <div class="flex min-h-screen items-center justify-center">
    <div class="max-w-md rounded-lg bg-black/90 p-6 text-center">
      <p class="text-cyan-300 text-xl">Erä {selectedHeat} ei ole olemassa</p>
      <p class="mt-2 text-gray-400 text-sm">
        Tämä tapahtuma sisältää {heats.length} erää.
      </p>
    </div>
  </div>
{:else if style !== "classic" && (isError || (!isLoading && !rounds))}
  <p class="w-fit rounded-md bg-neutral-950/90 px-3 py-2 text-cyan-300">
    {isError ? "Tulosten lataus epäonnistui" : "Kierros ei saatavilla"}
  </p>
{:else if style !== "classic" && isLoading}
  <Skeleton class="h-48 w-80 bg-neutral-900/80" />
{:else if style === "tower"}
  <Tower {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "ticker"}
  <Ticker {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "spotlight"}
  <Spotlight {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "classic-plus"}
  <ClassicPlus {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "classic-inline"}
  <ClassicInline {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "classic-focus"}
  <ClassicFocus {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "broadcast"}
  <Broadcast {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "broadcast-pinned"}
  <BroadcastPinned {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "broadcast-board"}
  <BroadcastBoard {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "broadcast-results"}
  <BroadcastResults {view} inHeat={Boolean(selectedHeat)} />
{:else if style.startsWith("broadcast-")}
  <BroadcastFrame
    {view}
    inHeat={Boolean(selectedHeat)}
    variant={frameVariant(style)}
  />
{:else}
  <div class="max-w-xs text-gray-50">
    <div class="w-full max-w-xs border-cyan-300 border-t-2 bg-black/90">
      <h2 class="px-2 text-cyan-300 uppercase">
        {#if rounds?.Name}
          {rounds.Name}
        {:else}
          <Skeleton class="my-1 h-4 w-28" />
        {/if}
      </h2>

      <div class="flex justify-between">
        <h3 class="bg-cyan-300 px-2 text-black uppercase">
          {#if competition?.Name}
            {competition.Name}
          {:else}
            <Skeleton class="my-1 h-4 w-24" />
          {/if}
        </h3>

        <h4 class="px-2 uppercase">Tulos</h4>
      </div>

      <div role="status" class="px-2 text-xs text-cyan-300">
        {#if data.isRefreshError}Päivitys viivästyy. Näytetään viimeisimmät
          saadut tulokset.{/if}
      </div>
      {#if isError}
        <p class="px-2 py-1 text-cyan-600 text-xl">Failed to load</p>
      {:else if isLoading}
        <ul>
          {#each Array.from({ length: 8 }) as _, i (i)}
            <li class="border-black/50 border-t-2">
              <div class="flex flex-[1_1_100%] justify-between px-4 py-2">
                <Skeleton class="h-4 w-40" />
                <Skeleton class="h-4 w-16" />
              </div>
            </li>
          {/each}
        </ul>
      {:else if !rounds}
        <p class="px-2 py-1 text-cyan-600 text-xl">Kierros ei saatavilla</p>
      {:else}
        <ul class="flex flex-col gap-1">
          {#each allocations as a (a.Id)}
            <li
              animate:flip={{
                duration: prefersReducedMotion.current ? 0 : 250,
              }}
              class="flex flex-wrap justify-between border-black/50 border-t-2"
            >
              <div
                class="flex flex-[1_1_100%] items-center justify-between gap-2 px-4 py-1"
              >
                <span class="flex min-w-0 items-center gap-2">
                  <AthleteBadge entry={a} />
                  <span>{a.Name}</span>
                </span>
                <span class="shrink-0 tabular-nums">{a.Result}</span>
              </div>

              {#if !isTrack}
                <ul class="ml-1 flex flex-[1_1_100%] bg-gray-300 text-black">
                  {#if a.Attempts === null}
                    <li aria-hidden="true" class="invisible">no</li>
                  {:else}
                    {#each normalizeAttempts(a.Attempts) as at, index (`${index}-${at.Line1 ?? ""}-${at.Line2 ?? ""}`)}
                      <li
                        class={cn(
                          "flex min-w-[16.7%] flex-col items-center justify-center px-1 py-2 even:bg-gray-200",
                          a.Result === at.Line1 && "bg-cyan-300/50!",
                        )}
                      >
                        <span>{at.Line1}</span>
                        {#if at.Line2}
                          <span>{at.Line2}</span>
                        {/if}
                      </li>
                    {/each}
                  {/if}
                </ul>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>

    <h1 class="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">
      {#if compDetails?.Competition?.Name}
        {compDetails.Competition.Name}
      {:else}
        <Skeleton class="my-1 h-4 w-24" />
      {/if}
    </h1>
  </div>
{/if}
