import type { ResultChange, LatestAttempt } from "$lib/result-changes.svelte";
import type { Allocation, EventCategory, TotalResult } from "~/types/comp";

export const overlayStyles = [
  "classic",
  "tower",
  "ticker",
  "spotlight",
  "classic-plus",
  "classic-inline",
  "classic-focus",
  "broadcast",
  "broadcast-pinned",
  "broadcast-board",
  "broadcast-refined",
  "broadcast-context",
  "broadcast-gap",
  "broadcast-swap",
  "broadcast-detail",
  "broadcast-quiet",
  "broadcast-trail",
  "broadcast-stacked",
  "broadcast-quiet-2",
  "broadcast-trail-2",
  "broadcast-stacked-2",
  "broadcast-trail-stack",
  "broadcast-trail-inline",
  "broadcast-trail-plain",
  "broadcast-results",
  "timetable",
] as const;
export type OverlayStyle = (typeof overlayStyles)[number];

export function parseOverlayStyle(value: string | null): OverlayStyle {
  return overlayStyles.find((style) => style === value) ?? "classic";
}

export type OverlayEntry = Allocation | TotalResult;

// Everything a design needs; the page owns fetching, selection and errors.
export type OverlayView = {
  entries: OverlayEntry[];
  eventCategory: EventCategory;
  eventName?: string;
  roundName?: string;
  competitionName?: string;
  heatLabel?: string;
  wind?: string;
  isLoading: boolean;
  isRefreshError: boolean;
  changes: {
    get: (id: number) => ResultChange | undefined;
    readonly latest: LatestAttempt | null;
  };
};

export type OverlayAttempt = { Line1?: string | null; Line2?: string | null };

const MAX_ATTEMPTS = 6;

export function normalizeAttempts(attempts: unknown): OverlayAttempt[] {
  if (!Array.isArray(attempts)) return [];
  const valid = attempts.filter(
    (value): value is OverlayAttempt =>
      typeof value === "object" && value !== null,
  );
  return valid.slice(-MAX_ATTEMPTS);
}

// Always six slots so attempt columns line up between athletes.
export function attemptSlots(attempts: unknown): OverlayAttempt[] {
  const list = normalizeAttempts(attempts);
  return [
    ...list,
    ...Array.from({ length: MAX_ATTEMPTS - list.length }, () => ({})),
  ];
}

// "KARSTILA J." reads at a glance; relay teams keep their full name.
export function shortName(entry: OverlayEntry) {
  if (!entry.Surname) return { surname: entry.Name, initial: "" };
  const initial = entry.Firstname ? `${entry.Firstname[0]}.` : "";
  return { surname: entry.Surname, initial };
}

// Clubs without a logo still get a badge so every row reads the same.
export const clubInitials = (entry: OverlayEntry) =>
  (entry.Organization?.Name ?? entry.Athletes?.[0]?.Organization?.Name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

export function rankOf(entry: OverlayEntry, index: number, inHeat: boolean) {
  const rank = inHeat ? entry.HeatRank : entry.ResultRank;
  return typeof rank === "number" && rank > 0
    ? rank
    : entry.Result
      ? index + 1
      : null;
}

export function qualification(entry: OverlayEntry) {
  if (entry.QRank) return "Q";
  if (entry.QResult) return "q";
  return null;
}

export const isFoul = (value?: string | null) =>
  !!value && /^[x×-]$/i.test(value.trim());
