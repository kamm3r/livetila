<script lang="ts">
  import { page } from "$app/state";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api";
  import { sortByResult } from "$lib/results";
  import { cn } from "$lib/utils";
  import type { Competition, CompetitionProperties } from "~/types/comp";

  type Attempt = {
    Line1?: string | null;
    Line2?: string | null;
  };

  const slug = $derived(page.params.slug ?? "");
  const compId = $derived(slug.split("-", 2)[0] ?? "");
  const eventId = $derived(slug.split("-", 2)[1] ?? "");
  const selectedHeat = $derived(page.url.searchParams.get("heat"));
  const selectedRound = $derived(page.url.searchParams.get("round"));

  const athletesQuery = createQuery<Competition>(() => ({
    queryKey: ["athletes", compId, eventId],
    queryFn: () => api.getAthletes(`${compId}/${eventId}`),
    enabled: Boolean(compId && eventId),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  }));

  const detailsQuery = createQuery<CompetitionProperties>(() => ({
    queryKey: ["competition-details", compId],
    queryFn: () => api.getCompetitionDetails(compId),
    enabled: Boolean(compId),
  }));

  const competition = $derived(athletesQuery.data ?? null);
  const compDetails = $derived(detailsQuery.data ?? null);
  const isLoading = $derived(athletesQuery.isPending);
  const isError = $derived(athletesQuery.isError);

  const eventCategory = $derived(competition?.EventCategory ?? "Field");
  const isTrack = $derived(
    eventCategory === "Track" || eventCategory === "Relay",
  );

  const roundIndex = $derived((Number(selectedRound) || 1) - 1);
  const rounds = $derived(competition?.Rounds?.[roundIndex]);
  const heats = $derived(rounds?.Heats ?? []);

  const heatIndex = $derived.by(() => {
    if (!selectedHeat) return null;

    const raw = Number(selectedHeat) - 1;

    return Number.isInteger(raw) ? raw : null;
  });

  const heatExists = $derived(
    heatIndex !== null && heatIndex >= 0 && heatIndex < heats.length,
  );

  const heat = $derived(
    heatExists && heatIndex !== null ? heats[heatIndex] : null,
  );

  const allocations = $derived(
    (selectedHeat ? (heat?.Allocations ?? []) : (rounds?.TotalResults ?? []))
      .slice()
      .sort((a, b) => sortByResult(a, b, "Field")),
  );

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

{#if rounds && selectedHeat && !heatExists}
  <div class="flex min-h-screen items-center justify-center">
    <div class="max-w-md rounded-lg bg-black/90 p-6 text-center">
      <p class="text-cyan-300 text-xl">Erä {selectedHeat} ei ole olemassa</p>
      <p class="mt-2 text-gray-400 text-sm">
        Tämä tapahtuma sisältää {heats.length} erää.
      </p>
    </div>
  </div>
{:else}
  <div class="max-w-xs text-gray-50">
    <div class="w-full max-w-xs border-cyan-300 border-t-2 bg-black/90">
      <h2 class="px-2 text-cyan-300 uppercase">
        {#if rounds?.Name}
          {rounds.Name}
        {:else}
          <div class="my-1 h-4 w-28 animate-pulse rounded bg-gray-700/60"></div>
        {/if}
      </h2>

      <div class="flex justify-between">
        <h3 class="bg-cyan-300 px-2 text-black uppercase">
          {#if competition?.Name}
            {competition.Name}
          {:else}
            <div class="my-1 h-4 w-24 animate-pulse rounded bg-black/20"></div>
          {/if}
        </h3>

        <h4 class="px-2 uppercase">Tulos</h4>
      </div>

      {#if isError}
        <p class="px-2 py-1 text-cyan-600 text-xl">Failed to load</p>
      {:else if isLoading}
        <ul>
          {#each Array.from({ length: 8 }) as _, i (i)}
            <li class="border-black/50 border-t-2">
              <div class="flex flex-[1_1_100%] justify-between px-4 py-2">
                <div class="h-4 w-40 animate-pulse rounded bg-gray-700/60"></div>
                <div class="h-4 w-16 animate-pulse rounded bg-gray-700/60"></div>
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
              class="flex flex-wrap justify-between border-black/50 border-t-2"
            >
              <div class="flex flex-[1_1_100%] justify-between px-4 py-1">
                {a.Name}
                <span class="tabular-nums">{a.Result}</span>
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
        <div class="my-1 h-4 w-24 animate-pulse rounded bg-gray-700/60"></div>
      {/if}
    </h1>
  </div>
{/if}