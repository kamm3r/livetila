<script lang="ts">
  import { selectCompetitionRound } from "$lib/competition-selection";
  import { page } from "$app/state";
  import { ClipboardList, Trophy, Users } from "@lucide/svelte";
  import ObsPopover from "$lib/components/obs-popover.svelte";
  import EventSwitcher from "$lib/components/event-switcher.svelte";
  import RoundSwitcher from "$lib/components/round-switcher.svelte";
  import TabsWithHaptics from "$lib/components/tabs-haptics.svelte";
  import RoundProvider from "$lib/components/round-provider.svelte";
  import ParticipantLayout from "$lib/components/participant-layout.svelte";
  import ProtocolLayout from "$lib/components/protocol-layout.svelte";
  import ResultLayout from "$lib/components/result-layout.svelte";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { createCompetitionData } from "$lib/competition-data.svelte";
  import { findSelectedEvent } from "$lib/competition-selection";

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
    selectedEvent?.Category === "Track" || selectedEvent?.Category === "Relay",
  );
  const isLoading = $derived(data.isLoading);
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
    <div role="status" class="text-sm text-muted-foreground">
      {#if data.isRefreshError}Päivitys viivästyy. Näytetään viimeisimmät saadut
        tulokset.{/if}
    </div>
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
          roundFromUrl={selectedRound?.RoundTypeCategory}
        />
      </div>

      {#key slug}
        <RoundProvider rounds={competition.Rounds} roundCategory={roundFromUrl}>
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
  <ResultLayout eventCategory={competition!.EventCategory} />
{/snippet}
