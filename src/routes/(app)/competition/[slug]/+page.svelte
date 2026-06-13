<script lang="ts">
  import { page } from "$app/state";
  import { ClipboardList, Trophy, Users } from "@lucide/svelte";
  import ObsPopover from "$lib/components/obs-popover.svelte";
  import EventSwitcher from "$lib/components/event-switcher.svelte";
  import RoundSwitcher from "$lib/components/round-switcher.svelte";
  import TabsWithHaptics from "$lib/components/tabs-haptics.svelte";
  import RoundProvider from "$lib/components/round-provider.svelte";
  import ResultProvider from "$lib/components/result-provider.svelte";
  import ParticipantLayout from "$lib/components/participant-layout.svelte";
  import ProtocolLayout from "$lib/components/protocol-layout.svelte";
  import ResultLayout from "$lib/components/result-layout.svelte";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { flattenEvents } from "$lib/events";
  import { api } from "$lib/api";
  import { createQuery } from "@tanstack/svelte-query";
  import type {
    Competition,
    CompetitionProperties,
    Events,
  } from "~/types/comp";

  const slug = $derived(page.params.slug ?? "");
  const compId = $derived(slug.split("-", 2)[0] ?? "");
  const eventId = $derived(slug.split("-", 2)[1] ?? "");

  const eventsQuery = createQuery<Events>(() => ({
    queryKey: ["events", compId],
    queryFn: () => api.getEvents(compId),
    enabled: Boolean(compId),
  }));

  const compEventsRaw = $derived(eventsQuery.data ?? null);
  const compEvents = $derived(
    compEventsRaw ? flattenEvents(compEventsRaw) : [],
  );
  const selectedEvent = $derived(
    compEvents.find((e) => e.EventId === Number(eventId)),
  );
  const isTrack = $derived(selectedEvent?.Category === "Track");
  const isProgress = $derived(selectedEvent?.Status === "Progress");

  const athletesQuery = createQuery<Competition>(() => ({
    queryKey: ["athletes", compId, eventId],
    queryFn: () => api.getAthletes(`${compId}/${eventId}`),
    enabled: Boolean(compId && eventId),
    refetchInterval: isProgress ? 1000 : false,
    refetchIntervalInBackground: false,
  }));

  const detailsQuery = createQuery<CompetitionProperties>(() => ({
    queryKey: ["competition-details", compId],
    queryFn: () => api.getCompetitionDetails(compId),
    enabled: Boolean(compId),
  }));

  const competition = $derived(athletesQuery.data ?? null);
  const compDetails = $derived(detailsQuery.data ?? null);

  const roundFromUrl = $derived(page.url.searchParams.get("round"));
  const initialRound = $derived(
    competition && roundFromUrl
      ? competition.Rounds.find((r) => r.RoundTypeCategory === roundFromUrl)
          ?.Index
      : undefined,
  );

  const isLoading = $derived(
    athletesQuery.isPending || detailsQuery.isPending || eventsQuery.isPending,
  );
  const error = $derived(
    athletesQuery.isError ? "Failed to load competition data" : null,
  );
</script>

<svelte:head>
  <title>{compDetails?.Competition.Name ?? "Kilpailu"} - Livetila</title>
</svelte:head>

<main class="container relative mx-auto flex grow flex-col px-4 py-4 sm:p-8">
  {#if !compId || !eventId}
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
    <div class="flex flex-col gap-4">
      <div class="flex flex-col items-start gap-3">
        <h2
          class="scroll-m-20 border-b pb-2 font-semibold text-2xl tracking-tight first:mt-0 sm:text-3xl"
        >
          {compDetails?.Competition.Name ?? ""}
        </h2>
        <EventSwitcher
          competitionId={compId}
          currentEventId={eventId}
          events={compEvents}
          {roundFromUrl}
        />
      </div>

      {#key eventId}
        <RoundProvider rounds={competition.Rounds} {initialRound}>
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
            <RoundSwitcher />
            <ObsPopover slug={`${compId}-${eventId}`} />
          </div>

          <TabsWithHaptics
            defaultValue="participants"
            tabs={[
              {
                value: "participants",
                label: "Ilmoittautuneet",
                icon: usersIcon,
                content: participantsContent,
              },
              {
                value: "protocol",
                label: "Pöytäkirjat",
                icon: clipboardIcon,
                content: protocolContent,
              },
              {
                value: "results",
                label: "Tulokset",
                icon: trophyIcon,
                content: resultsContent,
              },
            ]}
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
  <ResultProvider
    compId={`${compId}/${eventId}`}
    {isProgress}
    eventCategory={competition!.EventCategory}
  >
    <ResultLayout />
  </ResultProvider>
{/snippet}
