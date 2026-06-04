<script lang="ts">
  import { page } from "$app/state";
  import { CheckCircle } from "@lucide/svelte";
  import { ClipboardList, Trophy, Users } from "@lucide/svelte";
  import ObsPopover from "$lib/components/obs-popover.svelte";
  import EventSwitcher from "$lib/components/event-switcher.svelte";
  import { flattenEvents } from "$lib/events";
  import { sortByResult } from "$lib/results";
  import { api } from "$lib/api";
  import { createQuery } from "@tanstack/svelte-query";
  import { triggerHaptic } from "$lib/hooks/use-haptics";
  import type {
    Competition,
    CompetitionProperties,
    Events,
  } from "~/types/comp";
  import type { Heat, Round } from "~/types/comp";

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
  const isLoading = $derived(
    athletesQuery.isPending || detailsQuery.isPending || eventsQuery.isPending,
  );
  const error = $derived(athletesQuery.isError ? "Failed to load competition data" : null);

  // Round state
  const rounds = $derived(competition?.Rounds ?? []);
  let selectedRound = $state(0);
  let selectedHeat = $state(1);

  $effect(() => {
    if (rounds.length > 0 && selectedRound === 0) {
      selectedRound = rounds.at(-1)?.Index ?? 0;
    }
  });

  const currentRound = $derived(
    rounds.find((r) => r.Index === selectedRound) ?? rounds[0],
  );
  const heats = $derived(currentRound?.Heats ?? []);
  const currentHeat = $derived(
    heats.find((h) => h.Index === selectedHeat) ?? heats[0],
  );
  const showHeatNumbers = $derived(heats.length >= 2);

  function handleRoundChange(index: number) {
    triggerHaptic("selection");
    selectedRound = index;
    const round = rounds.find((r) => r.Index === index);
    selectedHeat = round?.Heats?.[0]?.Index ?? 1;
  }

  function handleHeatChange(index: number) {
    if (heats.some((h) => h.Index === index)) {
      triggerHaptic("selection");
      selectedHeat = index;
    }
  }

  // Tabs
  let activeTab = $state("participants");
  function handleTabChange(value: string) {
    triggerHaptic("selection");
    activeTab = value;
  }
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
        <div class="h-8 w-28 animate-pulse rounded-md bg-muted"></div>
        <div class="h-10 w-48 animate-pulse rounded-md bg-muted"></div>
      </div>
      <div class="mt-2 space-y-3">
        <div class="h-10 w-full animate-pulse rounded bg-muted"></div>
        <div class="h-14 w-full animate-pulse rounded bg-muted"></div>
        <div class="h-14 w-full animate-pulse rounded bg-muted"></div>
        <div class="h-14 w-full animate-pulse rounded bg-muted"></div>
      </div>
    </div>
  {:else if error}
    <div class="flex flex-col items-center justify-center py-20">
      <h2 class="font-bold text-2xl">Virhe</h2>
      <p class="mt-2 text-muted-foreground">{error}</p>
      <a href="/" class="mt-4 text-primary underline">Palaa etusivulle</a>
    </div>
  {:else if competition}
    {@const srounds = competition.Rounds ?? []}
    {@const hasMultipleRounds = srounds.length > 1}
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
        />
      </div>

      {#if hasMultipleRounds}
        <div class="flex flex-wrap gap-2">
          {#each srounds as round (round.Index)}
            <button
              class="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {selectedRound ===
              round.Index
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}"
              onclick={() => handleRoundChange(round.Index)}
            >
              {round.RoundTypeCategory === "Qualify"
                ? "Alkuerät"
                : round.RoundTypeCategory === "Final"
                  ? "Loppukilpailu"
                  : round.Name}
            </button>
          {/each}
        </div>
      {/if}

      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div></div>
        <ObsPopover slug={`${compId}-${eventId}`} />
      </div>

      <!-- Tabs -->
      <div class="mt-2 w-full">
        <div
          class="relative mb-2 grid h-auto w-full grid-cols-3 rounded-lg bg-muted p-1 text-muted-foreground"
        >
          <button
            class="relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {activeTab ===
            'participants'
              ? 'bg-background text-foreground shadow-xs'
              : 'hover:text-foreground'}"
            onclick={() => handleTabChange("participants")}
          >
            <div class="flex items-center justify-center gap-2">
              <Users class="size-4" /><span class="hidden sm:block"
                >Ilmoittautuneet</span
              >
            </div>
          </button>
          <button
            class="relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {activeTab ===
            'protocol'
              ? 'bg-background text-foreground shadow-xs'
              : 'hover:text-foreground'}"
            onclick={() => handleTabChange("protocol")}
          >
            <div class="flex items-center justify-center gap-2">
              <ClipboardList class="size-4" /><span class="hidden sm:block"
                >Pöytäkirjat</span
              >
            </div>
          </button>
          <button
            class="relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {activeTab ===
            'results'
              ? 'bg-background text-foreground shadow-xs'
              : 'hover:text-foreground'}"
            onclick={() => handleTabChange("results")}
          >
            <div class="flex items-center justify-center gap-2">
              <Trophy class="size-4" /><span class="hidden sm:block"
                >Tulokset</span
              >
            </div>
          </button>
        </div>

        <div class="space-y-5">
          <!-- Participants -->
          {#if activeTab === "participants"}
            <div class="space-y-6">
              {#if competition.Enrollments.length > 0}
                <table
                  class="hidden max-h-[600px] overflow-y-auto rounded-md border lg:table"
                >
                  <thead class="sticky top-0 backdrop-blur-md">
                    <tr class="border-b">
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs"
                      ></th>
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs w-full"
                        >Nimi ja Seura</th
                      >
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs"
                        >PB</th
                      >
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs"
                        >SB</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each competition.Enrollments as enrollment (enrollment.Id)}
                      <tr
                        class="border-b transition-colors hover:bg-muted/50 {enrollment.Confirmed
                          ? 'bg-green-300/10 hover:bg-green-300/15'
                          : ''}"
                      >
                        <td class="p-2 align-middle"
                          >{#if enrollment.Confirmed}<div
                              class="flex size-5 items-center justify-center"
                            >
                              <CheckCircle class="size-3 text-white" />
                            </div>{/if}</td
                        >
                        <td class="p-2 align-middle w-full">
                          <div class="flex flex-col">
                            <div class="flex items-center">
                              {#if enrollment.Number}<span
                                  class="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200"
                                  >{enrollment.Number}</span
                                >{/if}
                              <span class="font-medium">{enrollment.Name}</span>
                            </div>
                            <div class="mt-1 text-muted-foreground text-xs">
                              {enrollment.Organization?.Name ?? "-"}
                            </div>
                          </div>
                        </td>
                        <td class="p-2 align-middle"
                          ><span class="font-medium"
                            >{enrollment.PB || "-"}</span
                          ></td
                        >
                        <td class="p-2 align-middle"
                          ><span class="font-medium"
                            >{enrollment.SB || "-"}</span
                          ></td
                        >
                      </tr>
                    {/each}
                  </tbody>
                </table>
                <ul class="flex flex-col gap-4 lg:hidden">
                  {#each competition.Enrollments as enrollment (enrollment.Id)}
                    <li
                      class="rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4 sm:py-4 {enrollment.Confirmed
                        ? 'bg-green-300/10'
                        : ''}"
                    >
                      <div class="flex flex-col gap-2">
                        <div>
                          <h3 class="font-semibold text-sm sm:text-base">
                            {enrollment.Name}
                          </h3>
                          <p class="text-muted-foreground text-xs">
                            {enrollment.Organization?.Name ?? "-"}
                          </p>
                        </div>
                        <div class="flex gap-3 text-xs opacity-70">
                          <span>PB {enrollment.PB || "-"}</span><span
                            >SB {enrollment.SB || "-"}</span
                          >
                        </div>
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else}
                <div class="py-8 text-center">
                  <p class="text-muted-foreground">Ei ilmoittautuneita.</p>
                </div>
              {/if}
            </div>

            <!-- Protocol -->
          {:else if activeTab === "protocol"}
            <div class="space-y-6">
              {#if showHeatNumbers && heats.length > 0}
                <div class="mb-4 flex flex-wrap gap-2">
                  <div class="mb-2 w-full text-muted-foreground text-sm">
                    Valitse erä:
                  </div>
                  {#each [...heats].sort((a: any, b: any) => a.Index - b.Index) as heat (heat.Index)}
                    <button
                      class="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {selectedHeat ===
                      heat.Index
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}"
                      onclick={() => handleHeatChange(heat.Index)}
                      >Erä {heat.Index}</button
                    >
                  {/each}
                </div>
              {/if}
              {#if currentHeat && heats.length > 0}
                {@const heatAllocs = [...currentHeat.Allocations]}
                <table
                  class="hidden max-h-[600px] overflow-y-auto rounded-md border lg:table"
                >
                  <thead class="sticky top-0 backdrop-blur-md">
                    <tr class="border-b">
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs w-[100px]"
                        >{isTrack ? "Rata" : "Järjestys"}</th
                      >
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs w-full"
                        >Nimi ja Seura</th
                      >
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs"
                        >PB</th
                      >
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs"
                        >SB</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each heatAllocs as alloc (alloc.Id)}
                      <tr class="border-b transition-colors hover:bg-muted/50">
                        <td class="p-2 align-middle"
                          ><span>{alloc.Number || ""}</span></td
                        >
                        <td class="p-2 align-middle w-full">
                          <div class="flex flex-col">
                            <div class="flex items-center">
                              {#if alloc.Number}<span
                                  class="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200"
                                  >{alloc.Number}</span
                                >{/if}
                              <span class="font-medium">{alloc.Name}</span>
                            </div>
                            <div class="mt-1 text-muted-foreground text-xs">
                              {alloc.Organization?.Name ?? "-"}
                            </div>
                          </div>
                        </td>
                        <td class="p-2 align-middle"
                          ><span class="font-medium">{alloc.PB || "-"}</span
                          ></td
                        >
                        <td class="p-2 align-middle"
                          ><span class="font-medium">{alloc.SB || "-"}</span
                          ></td
                        >
                      </tr>
                    {/each}
                  </tbody>
                </table>
                <ul class="flex flex-col gap-4 lg:hidden">
                  {#each heatAllocs as alloc (alloc.Id)}
                    <li
                      class="rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4 sm:py-4"
                    >
                      <div class="flex flex-col gap-2">
                        <div>
                          <h3 class="font-semibold text-sm sm:text-base">
                            {alloc.Number || ""}
                            {alloc.Name}
                          </h3>
                          <p class="text-muted-foreground text-xs">
                            {alloc.Organization?.Name ?? "-"}
                          </p>
                        </div>
                        <div class="flex gap-3 text-xs opacity-70">
                          <span>PB {alloc.PB || "-"}</span><span
                            >SB {alloc.SB || "-"}</span
                          >
                        </div>
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else}
                <div class="py-8 text-center">
                  <p class="text-muted-foreground">
                    Eräjakoja ei ole saatavilla vielä...
                  </p>
                </div>
              {/if}
            </div>

            <!-- Results -->
          {:else if activeTab === "results"}
            {@const eventCategory = competition?.EventCategory ?? "Field"}
            {@const sortedAllocs =
              currentHeat && heats.length > 0
                ? [...currentHeat.Allocations].sort((a: any, b: any) =>
                    sortByResult(a, b, eventCategory),
                  )
                : []}
            {@const sortedTotal = currentRound?.TotalResults
              ? [...currentRound.TotalResults].sort((a: any, b: any) =>
                  sortByResult(a, b, eventCategory),
                )
              : []}

            <div class="space-y-6">
              {#if showHeatNumbers && heats.length > 0}
                <div class="mb-4 flex flex-wrap gap-2">
                  <div class="mb-2 w-full text-muted-foreground text-sm">
                    Valitse erä:
                  </div>
                  {#each [...heats].sort((a: any, b: any) => a.Index - b.Index) as heat (heat.Index)}
                    <button
                      class="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {selectedHeat ===
                      heat.Index
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}"
                      onclick={() => handleHeatChange(heat.Index)}
                      >Erä {heat.Index}</button
                    >
                  {/each}
                </div>
              {/if}

              {#if sortedAllocs.length > 0}
                <table
                  class="hidden max-h-[600px] overflow-y-auto rounded-md border lg:table"
                >
                  <thead class="sticky top-0 backdrop-blur-md">
                    <tr class="border-b">
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs w-[100px]"
                        >Sija</th
                      >
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs w-full"
                        >Nimi ja Seura</th
                      >
                      <th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs"
                        >Tulos</th
                      >
                    </tr>
                  </thead>
                  <tbody>
                    {#each sortedAllocs as alloc (alloc.Id)}
                      <tr class="border-b transition-colors hover:bg-muted/50">
                        <td class="p-2 align-middle"
                          ><span>{alloc.HeatRank}</span></td
                        >
                        <td class="p-2 align-middle w-full">
                          <div class="flex flex-col">
                            <div class="flex items-center">
                              {#if alloc.Number}<span
                                  class="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200"
                                  >{alloc.Number}</span
                                >{/if}
                              <span class="font-medium">{alloc.Name}</span>
                            </div>
                            <div class="mt-1 text-muted-foreground text-xs">
                              {alloc.Organization?.Name ?? "-"}
                            </div>
                          </div>
                        </td>
                        <td class="p-2 align-middle">
                          {#if alloc.Attempts}
                            <ul class="flex gap-2">
                              {#each alloc.Attempts as attempt, i}
                                <li
                                  class="-my-1 flex flex-col rounded bg-muted-foreground/20 px-2 py-1 text-sm {alloc.Result ===
                                  attempt.Line1
                                    ? 'border-primary/20! bg-primary/10! text-primary'
                                    : ''}"
                                >
                                  <span>{attempt.Line1}</span
                                  >{#if attempt.Line2}<span
                                      >{attempt.Line2}</span
                                    >{/if}
                                </li>
                              {/each}
                            </ul>
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
                <ul class="flex flex-col gap-4 lg:hidden">
                  {#each sortedAllocs as alloc (alloc.Id)}
                    <li
                      class="rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4 sm:py-4"
                    >
                      <div class="flex flex-col gap-2">
                        <div>
                          <h3 class="font-semibold text-sm sm:text-base">
                            {alloc.HeatRank || ""}
                            {alloc.Name}
                          </h3>
                          <p class="text-muted-foreground text-xs">
                            {alloc.Organization?.Name ?? "-"}
                          </p>
                        </div>
                        {#if alloc.Attempts}
                          <ul class="flex gap-2">
                            {#each alloc.Attempts as attempt, i}
                              <li
                                class="-my-1 flex flex-col rounded bg-muted-foreground/20 px-2 py-1 text-sm {alloc.Result ===
                                attempt.Line1
                                  ? 'border-primary/20! bg-primary/10! text-primary'
                                  : ''}"
                              >
                                <span>{attempt.Line1}</span
                                >{#if attempt.Line2}<span>{attempt.Line2}</span
                                  >{/if}
                              </li>
                            {/each}
                          </ul>
                        {/if}
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else}
                <div class="py-8 text-center">
                  <p class="text-muted-foreground">
                    Tuloksia ei ole saatavilla vielä...
                  </p>
                </div>
              {/if}

              {#if rounds.length > 1 && sortedTotal.length > 0}
                <h3 class="scroll-m-20 font-semibold text-2xl tracking-tight">
                  Kokonaistulokset
                </h3>
                <table
                  class="hidden max-h-[600px] overflow-y-auto rounded-md border lg:table"
                >
                  <thead class="sticky top-0 backdrop-blur-md"
                    ><tr class="border-b"
                      ><th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs w-[100px]"
                        >Sija</th
                      ><th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs w-full"
                        >Nimi ja Seura</th
                      ><th
                        class="h-10 px-2 text-left align-middle font-medium text-muted-foreground text-xs"
                        >Tulos</th
                      ></tr
                    ></thead
                  >
                  <tbody>
                    {#each sortedTotal as tr (tr.Id)}
                      <tr class="border-b transition-colors hover:bg-muted/50">
                        <td class="p-2 align-middle"
                          ><span>{tr.ResultRank}</span></td
                        >
                        <td class="p-2 align-middle w-full">
                          <div class="flex flex-col">
                            <span class="font-medium">{tr.Name}</span>
                            <div class="mt-1 text-muted-foreground text-xs">
                              {tr.Organization?.Name ?? "-"}
                            </div>
                          </div>
                        </td>
                        <td class="p-2 align-middle">
                          {#if tr.Attempts}
                            <ul class="flex gap-2">
                              {#each tr.Attempts as attempt, i}
                                <li
                                  class="-my-1 flex flex-col rounded bg-muted-foreground/20 px-2 py-1 text-sm {tr.Result ===
                                  attempt.Line1
                                    ? 'border-primary/20! bg-primary/10! text-primary'
                                    : ''}"
                                >
                                  <span>{attempt.Line1}</span
                                  >{#if attempt.Line2}<span
                                      >{attempt.Line2}</span
                                    >{/if}
                                </li>
                              {/each}
                            </ul>
                          {/if}
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
                <ul class="flex flex-col gap-4 lg:hidden">
                  {#each sortedTotal as tr (tr.Id)}
                    <li
                      class="rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4 sm:py-4"
                    >
                      <div class="flex flex-col gap-2">
                        <div>
                          <h3 class="font-semibold text-sm sm:text-base">
                            {tr.ResultRank || ""}
                            {tr.Name}
                          </h3>
                          <p class="text-muted-foreground text-xs">
                            {tr.Organization?.Name ?? "-"}
                          </p>
                        </div>
                        {#if tr.Attempts}
                          <ul class="flex gap-2">
                            {#each tr.Attempts as attempt, i}
                              <li
                                class="-my-1 flex flex-col rounded bg-muted-foreground/20 px-2 py-1 text-sm {tr.Result ===
                                attempt.Line1
                                  ? 'border-primary/20! bg-primary/10! text-primary'
                                  : ''}"
                              >
                                <span>{attempt.Line1}</span
                                >{#if attempt.Line2}<span>{attempt.Line2}</span
                                  >{/if}
                              </li>
                            {/each}
                          </ul>
                        {/if}
                      </div>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</main>
