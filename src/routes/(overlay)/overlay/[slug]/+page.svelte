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
  import { activeAllocationIds } from "$lib/active-attempt";
  import { createOverlayAttempts } from "$lib/overlay-attempts.svelte";
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
  // Messages wear the graphics' accent, which a stream can set with `?accent=`.
  const accent = $derived.by(() => {
    const value = page.url.searchParams.get("accent");
    return value && /^[\da-f]{6}$/i.test(value) ? `#${value}` : "#67e8f9";
  });
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
  const attemptDetails = createOverlayAttempts(
    () => allocations,
    () =>
      `${slug}/${rounds?.Id ?? rounds?.Index}/${selectedHeat ?? "overall"}/${style}`,
  );
  const view: OverlayView = $derived({
    entries: allocations,
    showAttempts: attemptDetails.expanded,
    activeAllocationIds: activeAllocationIds(rounds, selection.heat),
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

{#snippet notice(title: string, detail?: string)}
  <div
    class="w-fit border-(--accent) border-t-2 bg-neutral-950 px-3 py-2 font-semibold"
    style:--accent={accent}
    role="status"
  >
    <p class="text-(--accent) uppercase">{title}</p>
    {#if detail}<p class="mt-0.5 font-medium text-neutral-400 text-sm">
        {detail}
      </p>{/if}
  </div>
{/snippet}

{#if !data.identity}
  {@render notice("Virheellinen linkki")}
{:else if style === "timetable"}
  <Timetable
    events={flattenEvents(timetableEvents.data ?? {})}
    competitionName={compDetails?.Competition?.Name}
  />
{:else if rounds && selectedHeat && !heatExists}
  {@render notice(
    `Erä ${selectedHeat} ei ole olemassa`,
    `Tämä tapahtuma sisältää ${heats.length} erää.`,
  )}
{:else if isError || (!isLoading && !rounds)}
  {@render notice(
    isError ? "Tulosten lataus epäonnistui" : "Kierros ei saatavilla",
  )}
{:else if isLoading}
  <Skeleton class="h-48 w-80 bg-neutral-900/80" />
{:else if style === "ticker"}
  <Ticker {view} inHeat={Boolean(selectedHeat)} />
{:else if style === "broadcast-results"}
  <BroadcastResults {view} inHeat={Boolean(selectedHeat)} />
{:else}
  <BroadcastFrame {view} inHeat={Boolean(selectedHeat)} />
{/if}
