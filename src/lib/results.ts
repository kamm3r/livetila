import type { Allocation, EventCategory, Heat } from "~/types/comp";

const INVALID_RESULTS = ["DNS", "DQ", "DNF", "DSQ", "NH", "NM"] as const;

// Explained under the results table when they appear there.
const RESULT_CODES = [
  ["DNS", "ei startannut"],
  ["DNF", "keskeytti"],
  ["DQ", "hylätty kilpailusta"],
  ["NM", "ei hyväksyttyä tulosta"],
  ["NH", "ei hyväksyttyä korkeutta"],
] as const;

export function resultCodeLegend(
  entries: {
    Result: string | null;
    Attempts?: { Line1: string; Line2: string }[] | null;
  }[],
): string[] {
  const marks = entries.flatMap((entry) => [
    entry.Result,
    ...(entry.Attempts?.flatMap((attempt) => [attempt.Line1, attempt.Line2]) ??
      []),
  ]);
  const codes = new Set(
    marks.map((mark) => {
      const code = mark?.trim().toUpperCase();
      return code === "DSQ" ? "DQ" : code;
    }),
  );
  const legend: string[] = RESULT_CODES.filter(([code]) => codes.has(code)).map(
    ([code, label]) => `${code} = ${label}`,
  );
  if (marks.some((mark) => mark && TIME_RE.test(mark) && mark.endsWith("h")))
    legend.push("h = käsiajanotto");
  return legend;
}

// Times are "S,FF", "M.SS,FF" or "H:MM.SS,FF"; hand times use tenths and an
// "h" suffix ("3.12,6h").
const TIME_RE = /^(?:(\d+):)?(?:(\d+)\.)?(\d+),(\d{1,2})h?$/;
const SPRINT_FORMAT_RE = /^(\d),(\d{2})$/;

function parseFinishTimeToMs(value: string): number | null {
  const match = value.match(TIME_RE);
  if (!match) return null;
  const [, hours = "0", minutes = "0", seconds, fraction] = match;
  return (
    Number(hours) * 3_600_000 +
    Number(minutes) * 60_000 +
    Number(seconds) * 1000 +
    Number(fraction!.padEnd(2, "0")) * 10
  );
}

export function formatTrackResult(value: string | null): string | null {
  if (!value) return value;

  const sprintMatch = value.match(SPRINT_FORMAT_RE);
  if (sprintMatch) {
    const seconds = sprintMatch[1];
    const hundredths = sprintMatch[2];
    return `0${seconds},${hundredths}`;
  }

  return value;
}

export function parseResult(
  value: string | null,
  eventCategory: EventCategory,
): number {
  if (!value) return 0;
  if (INVALID_RESULTS.includes(value as (typeof INVALID_RESULTS)[number])) {
    return -1;
  }
  if (isTimed(eventCategory)) {
    const finishTime = parseFinishTimeToMs(value);
    if (finishTime === null) return 0;
    return finishTime;
  }
  const num = Number(value.replace(",", "."));
  return Number.isNaN(num) ? 0 : num;
}

export function sortByResult<
  T extends {
    Result: string | null;
    Attempts?: { Line1: string; Line2: string }[] | null;
    HeatRank?: number;
    ResultRank?: number;
  },
>(
  a: T,
  b: T,
  eventCategory: EventCategory,
  rankKey: "HeatRank" | "ResultRank" = "ResultRank",
): number {
  // Official ranks include tie-breaks that the displayed result cannot express.
  const rank = (value?: number) =>
    typeof value === "number" && Number.isFinite(value) && value > 0
      ? value
      : Infinity;
  const aRank = rank(a[rankKey]);
  const bRank = rank(b[rankKey]);
  if (aRank !== Infinity || bRank !== Infinity) {
    return aRank - bRank;
  }

  const aResult = parseResult(a.Result, eventCategory);
  const bResult = parseResult(b.Result, eventCategory);

  if (aResult === -1 && bResult !== -1) return 1;
  if (bResult === -1 && aResult !== -1) return -1;

  if (aResult > 0 && bResult > 0) {
    return eventCategory === "Field" ? bResult - aResult : aResult - bResult;
  }

  if (aResult > 0 && bResult === 0) return -1;
  if (bResult > 0 && aResult === 0) return 1;

  const aHasAttempts = (a.Attempts?.length ?? 0) > 0;
  const bHasAttempts = (b.Attempts?.length ?? 0) > 0;

  if (aHasAttempts && !bHasAttempts) return -1;
  if (bHasAttempts && !aHasAttempts) return 1;

  return 0;
}

// Every category except field events is ranked by time.
export const isTimed = (eventCategory: EventCategory) =>
  eventCategory !== "Field";

// The best valid result in a list, regardless of how the list is ordered.
export function leadingResult(
  entries: { Result: string | null }[],
  eventCategory: EventCategory,
): string | null {
  let leader: string | null = null;
  let best = 0;
  for (const { Result } of entries) {
    const value = parseResult(Result, eventCategory);
    if (value <= 0) continue;
    if (!best || (isTimed(eventCategory) ? value < best : value > best)) {
      best = value;
      leader = Result;
    }
  }
  return leader;
}

// Gap to the leading result: "−0.13" for field marks and "+0,13" (seconds) for
// times. The leader itself gets "—".
export function gapToLeader(
  result: string | null,
  leader: string | null,
  eventCategory: EventCategory,
): string | null {
  const value = parseResult(result, eventCategory);
  const best = parseResult(leader, eventCategory);
  if (value <= 0 || best <= 0) return null;
  if (value === best) return "—";
  if (isTimed(eventCategory)) return `+${formatTimeGap(value - best)}`;
  // Follow the leader's notation: "7,55" → "−0,13", centimetres "135" → "−5".
  const [, separator = ".", decimals = ""] = /([.,])(\d+)$/.exec(leader!) ?? [];
  const gap = (best - value).toFixed(decimals.length);
  return `−${gap.replace(".", separator)}`;
}

// "0,13", "1.01,41" or "1:00.13,00", matching how times are written.
function formatTimeGap(ms: number) {
  const hundredths = Math.round(ms / 10);
  const hours = Math.floor(hundredths / 360_000);
  const minutes = Math.floor(hundredths / 6000) % 60;
  const seconds = ((hundredths % 6000) / 100).toFixed(2).replace(".", ",");
  if (hours > 0)
    return `${hours}:${String(minutes).padStart(2, "0")}.${seconds.padStart(5, "0")}`;
  return minutes > 0 ? `${minutes}.${seconds.padStart(5, "0")}` : seconds;
}

// Whether a result equals or improves the athlete's personal or season best.
export function recordTag(
  entry: { Result: string | null; PB?: string | null; SB?: string | null },
  eventCategory: EventCategory,
): "PB" | "SB" | null {
  const value = parseResult(entry.Result, eventCategory);
  if (value <= 0) return null;
  const reaches = (record?: string | null) => {
    const target = parseResult(record ?? null, eventCategory);
    if (target <= 0) return false;
    return isTimed(eventCategory) ? value <= target : value >= target;
  };
  if (reaches(entry.PB)) return "PB";
  if (reaches(entry.SB)) return "SB";
  return null;
}

type OrderedEntry = {
  Position?: number;
  Attempts?: { Line1: string; Line2: string }[] | null;
};

export const attemptCount = (entry: OrderedEntry) =>
  entry.Attempts?.filter((attempt) => attempt.Line1).length ?? 0;

// Vertical jumps record attempts per height ("XO"), so turn order does not
// follow the horizontal round structure.
const VERTICAL_MARKS = /^[xo–-]+$/i;
export const isVerticalJump = (entries: OrderedEntry[]) =>
  entries.some((entry) =>
    entry.Attempts?.some((attempt) => VERTICAL_MARKS.test(attempt.Line2)),
  );

// Infers the previous and next athlete from the starting order. Finals often
// reorder athletes by rank after the third round and the API does not expose
// the new order, so nothing is inferred beyond that point.
export function turnOrder<T extends OrderedEntry>(
  entries: T[],
): { previous: T | null; next: T | null } {
  const none = { previous: null, next: null };
  if (entries.length === 0 || isVerticalJump(entries)) return none;
  const order = [...entries].sort(
    (a, b) => (a.Position ?? 0) - (b.Position ?? 0),
  );
  const round = Math.max(...order.map(attemptCount));
  if (round === 0 || round > 3) return none;
  const done = order.filter((entry) => attemptCount(entry) === round);
  // Athletes more than one attempt behind have most likely withdrawn.
  const waiting = order.filter((entry) => attemptCount(entry) === round - 1);
  const previous = done.at(-1) ?? null;
  if (waiting.length > 0) return { previous, next: waiting[0] ?? null };
  return { previous, next: round < 3 ? (order[0] ?? null) : null };
}

const finalists = 8;

// Field events cut the field after three rounds: the best eight continue to
// rounds 4–6. Entries must be in ranking order. Returns the ids of athletes
// whose series ended at three attempts, or an empty set while every athlete
// is still in (no fourth round yet, a small field, or vertical jumps).
export function eliminatedAfterThree<T extends OrderedEntry & { Id: number }>(
  entries: T[],
): Set<number> {
  const out = new Set<number>();
  if (isVerticalJump(entries)) return out;
  const counts = entries.map((entry) => entry.Attempts?.length ?? 0);
  if (Math.max(0, ...counts) <= 3) return out;
  // Someone below the cut with a fourth attempt means everyone continued.
  if (counts.some((count, index) => index >= finalists && count > 3))
    return out;
  entries.forEach((entry, index) => {
    if (index >= finalists && counts[index]! <= 3) out.add(entry.Id);
  });
  return out;
}

// The protocol's order: heats in turn, each by start position; athletes
// without a position go last.
export function protocolOrder(
  heats: Heat[],
): { index: number; allocations: Allocation[] }[] {
  const position = (entry: Allocation) => entry.Position || Infinity;
  return [...heats]
    .sort((a, b) => a.Index - b.Index)
    .map((heat) => ({
      index: heat.Index,
      allocations: [...heat.Allocations].sort(
        (a, b) => position(a) - position(b),
      ),
    }));
}
