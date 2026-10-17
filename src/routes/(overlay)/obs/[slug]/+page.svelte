<script lang="ts">
  import { selectOverlayRound } from "$lib/competition-selection";
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    competitionQueries,
    createCompetitionData,
  } from "$lib/competition-data.svelte";
  import { flattenEvents } from "$lib/events";
  import { isTimed, sortByResult } from "$lib/results";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { createResultChanges } from "$lib/result-changes.svelte";
  import {
    parseOverlayStyle,
    type OverlayView,
  } from "$lib/components/overlay/overlay";
  import Ticker from "$lib/components/overlay/ticker.svelte";
  import BroadcastFrame from "$lib/components/overlay/broadcast-frame.svelte";
  import BroadcastResults from "$lib/components/overlay/broadcast-results.svelte";
  import Timetable from "$lib/components/overlay/timetable.svelte";

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
{:else if isError || (!isLoading && !rounds)}
  <p class="w-fit rounded-md bg-neutral-950/90 px-3 py-2 text-cyan-300">
    {isError ? "Tulosten lataus epäonnistui" : "Kierros ei saatavilla"}
  </p>
{:else if isLoading}
  <Skeleton class="h-48 w-80 bg-neutral-900/80" />
{:else if style === "ticker"}
  <Ticker {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "broadcast-results"}
  <BroadcastResults {view} inHeat={Boolean(selectedHeat)} />
{:else}
  <BroadcastFrame {view} inHeat={Boolean(selectedHeat)} />
{/if}
