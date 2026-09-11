import { createQuery, queryOptions } from "@tanstack/svelte-query";
import { api } from "./api";
import { parseCompetitionSlug } from "./competition-selection";
import { flattenEvents } from "./events";

// Results must refresh without waiting for a status change. OBS keeps polling
// when its document is hidden; ordinary viewing follows foreground visibility.
const liveInterval = 1000;
const validId = (id?: string) => Boolean(id && /^\d+$/.test(id));

export const competitionQueries = {
  competitions: () =>
    queryOptions({
      queryKey: ["competitions"],
      queryFn: ({ signal }) => api.getCompetitions(signal),
    }),
  events: (id?: string, live = false) =>
    queryOptions({
      queryKey: ["events", id],
      queryFn: ({ signal }) => api.getEvents(id!, signal),
      enabled: validId(id),
      refetchInterval: live ? liveInterval : false,
    }),
  results: (slug: string, background: boolean) => {
    const identity = parseCompetitionSlug(slug);
    return queryOptions({
      queryKey: ["athletes", identity?.competitionId, identity?.eventId],
      queryFn: ({ signal }) =>
        api.getAthletes(
          `${identity!.competitionId}/${identity!.eventId}`,
          signal,
        ),
      enabled: identity !== null,
      refetchInterval: liveInterval,
      refetchIntervalInBackground: background,
    });
  },
  details: (id?: string) =>
    queryOptions({
      queryKey: ["competition-details", id],
      queryFn: ({ signal }) => api.getCompetitionDetails(id!, signal),
      enabled: validId(id),
    }),
};

export function createCompetitionData(
  slug: () => string,
  mode: "competition" | "overlay",
) {
  const identity = $derived(parseCompetitionSlug(slug()));
  const results = createQuery(() =>
    competitionQueries.results(slug(), mode === "overlay"),
  );
  const details = createQuery(() =>
    competitionQueries.details(identity?.competitionId),
  );
  const events = createQuery(() =>
    competitionQueries.events(
      mode === "competition" ? identity?.competitionId : undefined,
      true,
    ),
  );
  const requiredQueries = $derived(
    mode === "competition" ? [results, details, events] : [results],
  );
  const eventList = $derived(flattenEvents(events.data ?? {}));
  return {
    get identity() {
      return identity;
    },
    get competition() {
      return results.data ?? null;
    },
    get details() {
      return details.data ?? null;
    },
    get events() {
      return eventList;
    },
    get isLoading() {
      return (
        identity !== null &&
        (results.isPending ||
          (mode === "competition" && (details.isPending || events.isPending)))
      );
    },
    // A failed refresh retains cached data and must not unmount its callers.
    get isError() {
      return requiredQueries.some(
        (query) => query.isError && query.data === undefined,
      );
    },
    get isRefreshError() {
      return requiredQueries.some(
        (query) =>
          query.data !== undefined && (query.isError || query.failureCount > 0),
      );
    },
  };
}
