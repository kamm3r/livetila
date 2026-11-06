<script lang="ts">
  import { selectCompetitionRound } from "$lib/competition-selection";
  import { isTimed } from "$lib/results";
  import { page } from "$app/state";
  import { replaceState } from "$app/navigation";
  import { createQuery } from "@tanstack/svelte-query";
  import OverlayPopover from "$lib/components/overlay-popover.svelte";
  import LiveIndicator from "$lib/components/live-indicator.svelte";
  import EventSwitcher from "$lib/components/event-switcher.svelte";
  import RoundSwitcher from "$lib/components/round-switcher.svelte";
  import TabsWithHaptics from "$lib/components/tabs-haptics.svelte";
  import RoundProvider from "$lib/components/round-provider.svelte";
  import ConfirmationBanner from "$lib/components/confirmation-banner.svelte";
  import ParticipantLayout from "$lib/components/participant-layout.svelte";
  import ProtocolLayout from "$lib/components/protocol-layout.svelte";
  import ResultLayout from "$lib/components/result-layout.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import {
    competitionQueries,
    createCompetitionData,
  } from "$lib/competition-data.svelte";
  import { findSelectedEvent } from "$lib/competition-selection";
  import {
    onlineConfirmation,
    usesOnlineConfirmation,
  } from "$lib/online-confirmation";

  const slug = $derived(page.params.slug ?? "");
  const data = createCompetitionData(() => slug, "competition");
  const compId = $derived(data.identity?.competitionId ?? "");
  const eventId = $derived(data.identity?.eventId ?? "");
  const competition = $derived(data.competition);
  const compDetails = $derived(data.details);
  const compEvents = $derived(data.events);
  const roundFromUrl = $derived(page.url.searchParams.get("round"));
  const selectedRound = $derived(
    selectCompetitionRound(competition?.Rounds ?? [], roundFromUrl).round,
  );

  const selectedEvent = $derived(
    findSelectedEvent(compEvents, eventId, selectedRound?.RoundTypeCategory),
  );
  const isTrack = $derived(
    selectedEvent ? isTimed(selectedEvent.Category) : false,
  );
  const isLoading = $derived(data.isLoading);

  // The venue is only listed in the competition index. It is optional, so it
  // never delays or blocks the page.
  const competitions = createQuery(() => ({
    ...competitionQueries.competitions(),
    enabled: data.identity !== null,
  }));
  const venue = $derived(
    competitions.data?.find((comp) => String(comp.Id) === compId)?.Stadion
      ?.Name,
  );
  const competitionDate = $derived.by(() => {
    const date = new Date(compDetails?.Competition.BeginDate ?? "");
    return Number.isNaN(date.getTime())
      ? null
      : date.toLocaleDateString("fi-FI");
  });
  const subline = $derived(
    [competitionDate, venue].filter(Boolean).join(" · "),
  );
  const eventTime = $derived.by(() => {
    const date = new Date(selectedEvent?.BeginDateTimeWithTZ ?? "");
    return Number.isNaN(date.getTime())
      ? null
      : date.toLocaleTimeString("fi-FI", {
          hour: "2-digit",
          minute: "2-digit",
        });
  });

  // Open on the tab most relevant to the event's progress unless the link
  // names one explicitly.
  const tabs = ["participants", "protocol", "results"] as const;
  const statusTab: Record<string, (typeof tabs)[number]> = {
    Unallocated: "participants",
    Allocated: "protocol",
    Progress: "results",
    Official: "results",
  };
  const initialTab = $derived.by(() => {
    const fromUrl = page.url.searchParams.get("tab");
    if (visibleTabs.some((tab) => tab === fromUrl)) return fromUrl!;
    const fromStatus = statusTab[selectedEvent?.Status ?? ""];
    return fromStatus && visibleTabs.includes(fromStatus)
      ? fromStatus
      : "participants";
  });

  function handleTabChange(tab: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    replaceState(url, page.state);
  }
  const statusLabel: Record<string, string> = {
    Unallocated: "Eräjako tulossa",
    Allocated: "Eräjaot tehty",
    Official: "Tulokset valmiit",
  };
  const isLive = $derived(selectedEvent?.Status === "Progress");
  // The header carries the date unless the competition lasts several days.
  const eventDate = $derived.by(() => {
    if (new Set(compEvents.map((event) => event.date)).size < 2) return null;
    const date = new Date(selectedEvent?.BeginDateTimeWithTZ ?? "");
    return Number.isNaN(date.getTime())
      ? null
      : date.toLocaleDateString("fi-FI");
  });
  const eventMeta = $derived(
    [
      !isLive && selectedEvent ? statusLabel[selectedEvent.Status] : null,
      eventTime &&
        `${selectedEvent?.Status === "Progress" || selectedEvent?.Status === "Official" ? "alkoi" : "alkaa"} ${eventTime}`,
      eventDate,
    ]
      .filter(Boolean)
      .join(" · "),
  );

  // Before confirmation opens nobody has confirmed; a plain count reads better
  // than "0/9" then.
  const confirmedCount = $derived(
    competition?.Enrollments.filter((entry) => entry.Confirmed).length ?? 0,
  );
  // Shown only while the portal accepts confirmations for this event.
  const portal = createQuery(() =>
    competitionQueries.confirmations(usesOnlineConfirmation(compDetails)),
  );
  let now = $state(Date.now());
  $effect(() => {
    const timer = setInterval(() => (now = Date.now()), 30_000);
    return () => clearInterval(timer);
  });
  const confirmation = $derived(
    onlineConfirmation(
      portal.data?.find((comp) => String(comp.Id) === compId),
      selectedEvent?.BeginDateTimeWithTZ,
      now,
    ),
  );
  const allocations = $derived(
    selectedRound?.Heats.flatMap((heat) => heat.Allocations) ?? [],
  );
  const resultCount = $derived(
    allocations.filter((entry) => entry.Result).length ||
      (selectedRound?.TotalResults ?? []).filter((entry) => entry.Result)
        .length,
  );

  // Protocols and results appear once the event has them; an unknown status
  // falls back to the data alone. A tab stays once shown so a reverted
  // allocation cannot pull it away mid-view.
  const status = $derived(selectedEvent?.Status);
  const available = $derived({
    protocol:
      status === "Allocated" ||
      status === "Progress" ||
      status === "Official" ||
      allocations.length > 0,
    results: status === "Progress" || status === "Official" || resultCount > 0,
  });
  let revealed = $state<Record<string, boolean>>({});
  $effect(() => {
    if (available.protocol) revealed[`${slug}/protocol`] = true;
    if (available.results) revealed[`${slug}/results`] = true;
  });
  const visibleTabs = $derived(
    tabs.filter(
      (tab) =>
        tab === "participants" || available[tab] || revealed[`${slug}/${tab}`],
    ),
  );

  const error = $derived(
    data.isError ? "Kilpailutietojen lataaminen epäonnistui" : null,
  );
</script>

<svelte:head>
  <title>{compDetails?.Competition.Name ?? "Kilpailu"} - Livetila</title>
</svelte:head>

<main class="page-width relative flex grow flex-col pt-3 pb-4 sm:py-8">
  {#if !data.identity}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-2 pb-14 text-center"
    >
      <h2 class="font-semibold text-2xl tracking-tight">Virheellinen linkki</h2>
      <a href="/" class="mt-2 text-primary text-sm underline underline-offset-4"
        >Palaa etusivulle</a
      >
    </div>
  {:else if isLoading}
    <!-- Same frame as the loaded page, so nothing jumps when data arrives. -->
    <div class="flex flex-col gap-3 sm:gap-4" aria-hidden="true">
      <div class="flex flex-col gap-1.5">
        <Skeleton class="h-7 w-64 max-w-full" />
        <Skeleton class="h-4 w-48" />
      </div>
      <Skeleton class="h-9 w-56 max-w-full" />
      <Skeleton class="mb-1 h-5 w-72 max-w-full" />
      <div class="data-frame">
        <div class="data-head h-9"></div>
        {#each { length: 8 }, i (i)}
          <div
            class="flex h-12 items-center gap-3 border-t px-3 [.data-head+&]:border-t-0"
          >
            <Skeleton class="size-6 shrink-0 rounded-full" />
            <Skeleton class="h-4 w-40 max-w-1/2" />
            <Skeleton class="ml-auto h-4 w-12" />
          </div>
        {/each}
      </div>
    </div>
  {:else if error}
    <div
      class="flex flex-1 flex-col items-center justify-center gap-2 pb-14 text-center"
    >
      <h2 class="font-semibold text-2xl tracking-tight">{error}</h2>
      <div class="mt-3 flex items-center gap-4 text-sm">
        <Button onclick={() => location.reload()}>Yritä uudelleen</Button>
        <a href="/" class="text-muted-foreground underline underline-offset-4"
          >Palaa etusivulle</a
        >
      </div>
    </div>
  {:else if competition}
    <div class="flex flex-col gap-2.5 sm:gap-4">
      <div class="flex flex-col gap-0.5 sm:gap-1">
        <h2
          class="font-semibold text-xl tracking-tight text-balance sm:text-2xl"
        >
          {compDetails?.Competition.Name ?? ""}
        </h2>
        {#if subline}
          <p class="text-muted-foreground text-[13px] tabular-nums">
            {subline}
          </p>
        {/if}
      </div>

      {#key slug}
        <RoundProvider rounds={competition.Rounds} roundCategory={roundFromUrl}>
          <!-- Event, then round, then status. On a phone the event and the
               overlay button share the first line. -->
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-y-2">
            <div class="order-1 min-w-0 max-sm:flex-1 sm:shrink-0">
              <EventSwitcher
                competitionId={compId}
                currentEventId={eventId}
                events={compEvents}
                roundFromUrl={selectedRound?.RoundTypeCategory}
                roundShownElsewhere={competition.Rounds.length > 1}
              />
            </div>
            <div class="order-2 sm:order-9">
              <OverlayPopover
                slug={`${compId}-${eventId}`}
                competitionName={compDetails?.Competition.Name}
                eventName={competition.Name}
                events={compEvents}
                eventCategory={competition.EventCategory}
              />
            </div>
            <div class="order-3 basis-full sm:hidden"></div>
            <div class="order-4 empty:hidden sm:order-2"><RoundSwitcher /></div>
            <div class="order-5 has-[>[role=status]:empty]:hidden">
              <LiveIndicator
                live={isLive}
                failingSince={data.refreshFailingSince}
              />
            </div>
            {#if eventMeta}
              <span
                class="order-6 text-muted-foreground text-[13px] tabular-nums"
                >{eventMeta}</span
              >
            {/if}
            <div class="order-7 flex-1 max-sm:hidden"></div>
          </div>

          {#if confirmation}
            <ConfirmationBanner {confirmation} {now} />
          {/if}

          <TabsWithHaptics
            defaultValue={initialTab}
            onValueChange={handleTabChange}
            tabs={[
              {
                value: "participants" as const,
                label: "Ilmoittautuneet",
                count: confirmedCount
                  ? `${confirmedCount}/${competition.Enrollments.length}`
                  : competition.Enrollments.length || undefined,
                countLabel: confirmedCount
                  ? `${confirmedCount}/${competition.Enrollments.length} vahvistanut`
                  : undefined,
                content: participantsContent,
              },
              {
                value: "protocol" as const,
                label: "Pöytäkirjat",
                content: protocolContent,
              },
              {
                value: "results" as const,
                label: "Tulokset",
                content: resultsContent,
              },
            ].filter((tab) => visibleTabs.includes(tab.value))}
          />
        </RoundProvider>
      {/key}
    </div>
  {/if}
</main>

{#snippet participantsContent()}
  <ParticipantLayout enrollments={competition!.Enrollments} />
{/snippet}

{#snippet protocolContent()}
  <ProtocolLayout {isTrack} />
{/snippet}

{#snippet resultsContent()}
  <ResultLayout
    eventCategory={competition!.EventCategory}
    eventSubCategory={competition!.EventSubCategory}
    isCombinedEvent={competition!.IsCombinedEvent}
    live={isLive}
    fresh={data.refreshFailingSince === null}
  />
{/snippet}
