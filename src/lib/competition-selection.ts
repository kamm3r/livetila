import type { EventList, Round } from "~/types/comp";

export type CompetitionIdentity = { competitionId: string; eventId: string };
export type HeatSelection = { round: number; heat: number };

export function parseCompetitionSlug(slug: string): CompetitionIdentity | null {
  const match = /^(\d+)-(\d+)$/.exec(slug);
  return match ? { competitionId: match[1]!, eventId: match[2]! } : null;
}

function eventRound(name: string): string | undefined {
  if (name === "Alkuerät") return "Qualify";
  if (name === "Loppukilpailu") return "Final";
}

export function competitionEventLink(
  competitionId: string | number,
  event: Pick<EventList, "EventId" | "Name">,
): string {
  const round = eventRound(event.Name);
  return `/competition/${competitionId}-${event.EventId}${round ? `?round=${round}` : ""}`;
}

export function findSelectedEvent<
  T extends Pick<EventList, "EventId" | "Name">,
>(events: T[], eventId: string, round?: string | null): T | undefined {
  const matches = events.filter((event) => event.EventId === Number(eventId));
  return (
    matches.find((event) => eventRound(event.Name) === round) ?? matches[0]
  );
}

// Competition URLs use category tokens. Index values are domain identifiers,
// not array positions. Heat choices only survive within their selected round.
export function selectCompetitionRound(
  rounds: Round[],
  category?: string | null,
  selectedHeat?: HeatSelection | null,
) {
  const round =
    rounds.find((item) => item.RoundTypeCategory === category) ?? rounds.at(-1);
  const heats = round?.Heats ?? [];
  const heat =
    (selectedHeat?.round === round?.Index
      ? heats.find((item) => item.Index === selectedHeat?.heat)
      : undefined) ?? heats[0];
  return { round, heat, heats };
}

export function competitionRoundLink(
  url: URL,
  rounds: Round[],
  index: number,
): URL | null {
  const round = rounds.find((item) => item.Index === index);
  if (!round) return null;
  const next = new URL(url);
  next.searchParams.set("round", round.RoundTypeCategory);
  return next;
}

// Existing OBS links use one-based array positions. Keep this translation here
// so non-contiguous domain Index values never change the copied URL format.
export function overlayLink(
  slug: string,
  rounds: Round[],
  selection: HeatSelection,
): string {
  const params = new URLSearchParams();
  const round = rounds.findIndex((item) => item.Index === selection.round);
  const heat =
    rounds[round]?.Heats.findIndex((item) => item.Index === selection.heat) ??
    -1;
  if (round >= 0) params.set("round", String(round + 1));
  if (heat >= 0) params.set("heat", String(heat + 1));
  return `/obs/${slug}?${params}`;
}

export function selectOverlayRound(rounds: Round[], params: URLSearchParams) {
  const round = rounds[(Number(params.get("round")) || 1) - 1];
  const selectedHeat = params.get("heat");
  const position = selectedHeat ? Number(selectedHeat) - 1 : NaN;
  const heat = Number.isInteger(position) ? round?.Heats[position] : undefined;
  return {
    round,
    heat,
    selectedHeat,
    allocations: selectedHeat
      ? (heat?.Allocations ?? [])
      : (round?.TotalResults ?? []),
  };
}

export function isCompetitionLink(value: string): boolean {
  return /^\/competition\/\d+-\d+(\?round=(Qualify|Final))?$/.test(value);
}
