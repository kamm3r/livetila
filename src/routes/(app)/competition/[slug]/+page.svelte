<script lang="ts">
  import { selectCompetitionRound } from "$lib/competition-selection";
  import { isTimed } from "$lib/results";
  import { page } from "$app/state";
  import { replaceState } from "$app/navigation";
  import { ClipboardList, Trophy, Users } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import ObsPopover from "$lib/components/obs-popover.svelte";
  import LiveIndicator from "$lib/components/live-indicator.svelte";
  import EventSwitcher from "$lib/components/event-switcher.svelte";
  import RoundSwitcher from "$lib/components/round-switcher.svelte";
  import TabsWithHaptics from "$lib/components/tabs-haptics.svelte";
  import RoundProvider from "$lib/components/round-provider.svelte";
  import ConfirmationBanner from "$lib/components/confirmation-banner.svelte";
  import ParticipantLayout from "$lib/components/participant-layout.svelte";
  import ProtocolLayout from "$lib/components/protocol-layout.svelte";
  import ResultLayout from "$lib/components/result-layout.svelte";
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
    Unallocated: "Eräjaot puuttuvat",
    Allocated: "Eräjaot tehty",
    Official: "Tulokset valmiit",
  };
  const isLive = $derived(selectedEvent?.Status === "Progress");
  const eventMeta = $derived(
    [
      !isLive && selectedEvent ? statusLabel[selectedEvent.Status] : null,
      eventTime,
      selectedEvent?.date,
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

<main class="container relative mx-auto flex grow flex-col px-4 py-4 sm:p-8">
  {#if !data.identity}
    <div class="flex flex-col items-center justify-center py-20">
      <h2 class="font-bold text-2xl">Virheellinen linkki</h2>
      <a href="/" class="mt-4 text-primary underline">Palaa etusivulle</a>
    </div>
  {:else if isLoading}
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <Skeleton class="h-8 w-28 rounded-md" />
        <Skeleton class="h-10 w-48 rounded-md" />
      </div>
      <div class="mt-2 flex flex-col gap-3">
        <Skeleton class="h-10 w-full" />
        <Skeleton class="h-14 w-full" />
        <Skeleton class="h-14 w-full" />
        <Skeleton class="h-14 w-full" />
      </div>
    </div>
  {:else if error}
    <div class="flex flex-col items-center justify-center py-20">
      <h2 class="font-bold text-2xl">Virhe</h2>
      <p class="mt-2 text-muted-foreground">{error}</p>
      <a href="/" class="mt-4 text-primary underline">Palaa etusivulle</a>
    </div>
  {:else if competition}
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
        <h2 class="font-semibold text-xl tracking-tight sm:text-[22px]">
          {compDetails?.Competition.Name ?? ""}
        </h2>
        {#if subline}
          <p class="text-muted-foreground text-xs sm:text-[13px]">
            {subline}
          </p>
        {/if}
      </div>

      {#key slug}
        <RoundProvider rounds={competition.Rounds} roundCategory={roundFromUrl}>
          <!-- Mobile: switcher and OBS on one line, status and rounds below. -->
          <div class="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
            <div class="order-1 min-w-0 max-sm:flex-1 sm:shrink-0">
              <EventSwitcher
                competitionId={compId}
                currentEventId={eventId}
                events={compEvents}
                roundFromUrl={selectedRound?.RoundTypeCategory}
              />
            </div>
            <div class="order-2 sm:order-9">
              <ObsPopover
                slug={`${compId}-${eventId}`}
                competitionName={compDetails?.Competition.Name}
                eventName={competition.Name}
                events={compEvents}
                eventCategory={competition.EventCategory}
              />
            </div>
            <div class="order-3 basis-full sm:hidden"></div>
            <span
              class="hidden h-4.5 w-px bg-border sm:order-4 sm:block"
              aria-hidden="true"
            ></span>
            <div class="order-5 empty:hidden">
              <LiveIndicator
                live={isLive}
                failingSince={data.refreshFailingSince}
              />
            </div>
            {#if eventMeta}
              <span
                class="order-6 text-muted-foreground text-xs tabular-nums sm:text-[13px]"
                >{eventMeta}</span
              >
            {/if}
            <div class="order-7 flex-1"></div>
            <div class="order-8">
              <RoundSwitcher />
            </div>
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
                shortLabel: "Ilmoitt.",
                count: confirmedCount
                  ? `${confirmedCount}/${competition.Enrollments.length}`
                  : competition.Enrollments.length,
                countLabel: confirmedCount
                  ? `${confirmedCount}/${competition.Enrollments.length} vahvistanut`
                  : undefined,
                icon: usersIcon,
                content: participantsContent,
              },
              {
                value: "protocol" as const,
                label: "Pöytäkirjat",
                shortLabel: "Pöytäk.",
                count: allocations.length,
                icon: clipboardIcon,
                content: protocolContent,
              },
              {
                value: "results" as const,
                label: "Tulokset",
                count: resultCount,
                icon: trophyIcon,
                content: resultsContent,
              },
            ].filter((tab) => visibleTabs.includes(tab.value))}
          />
        </RoundProvider>
      {/key}
    </div>
  {/if}
</main>

{#snippet usersIcon()}
  <Users class="size-4" />
{/snippet}

{#snippet clipboardIcon()}
  <ClipboardList class="size-4" />
{/snippet}

{#snippet trophyIcon()}
  <Trophy class="size-4" />
{/snippet}

{#snippet participantsContent()}
  <ParticipantLayout enrollments={competition!.Enrollments} />
{/snippet}

{#snippet protocolContent()}
  <ProtocolLayout {isTrack} />
{/snippet}

{#snippet resultsContent()}
  <ResultLayout eventCategory={competition!.EventCategory} live={isLive} />
{/snippet}
