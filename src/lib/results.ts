const INVALID_RESULTS = ["DNS", "DQ", "DNF", "DSQ", "NH", "NM"] as const;

const SPRINT_RE = /^(\d+),(\d{2})$/;
const DISTANCE_RE = /^(\d+)\.(\d{2}),(\d{2})$/;
const SPRINT_FORMAT_RE = /^(\d),(\d{2})$/;

function parseFinishTimeToMs(value: string): number | null {
  let match = value.match(SPRINT_RE);
  if (match) {
    const seconds = Number(match[1]);
    const hundredths = Number(match[2]);
    return seconds * 1000 + hundredths * 10;
  }

  match = value.match(DISTANCE_RE);
  if (match) {
    const minutes = Number(match[1]);
    const seconds = Number(match[2]);
    const hundredths = Number(match[3]);
    return minutes * 60000 + seconds * 1000 + hundredths * 10;
  }

  return null;
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
  eventCategory: "Track" | "Field" | "Relay",
): number {
  if (!value) return 0;
  if (INVALID_RESULTS.includes(value as (typeof INVALID_RESULTS)[number])) {
    return -1;
  }
  if (eventCategory === "Track" || eventCategory === "Relay") {
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
  eventCategory: "Track" | "Field" | "Relay",
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

const isTimed = (eventCategory: "Track" | "Field" | "Relay") =>
  eventCategory === "Track" || eventCategory === "Relay";

// Gap to the leading result, in the leader's own notation: "−0.13" for field
// marks and "+0,13" (seconds) for times. The leader itself gets "—".
export function gapToLeader(
  result: string | null,
  leader: string | null,
  eventCategory: "Track" | "Field" | "Relay",
): string | null {
  const value = parseResult(result, eventCategory);
  const best = parseResult(leader, eventCategory);
  if (value <= 0 || best <= 0) return null;
  if (value === best) return "—";
  const timed = isTimed(eventCategory);
  const diff = timed ? (value - best) / 1000 : best - value;
  const separator = timed || leader?.includes(",") ? "," : ".";
  return `${timed ? "+" : "−"}${diff.toFixed(2).replace(".", separator)}`;
}

// Whether a result equals or improves the athlete's personal or season best.
export function recordTag(
  entry: { Result: string | null; PB?: string | null; SB?: string | null },
  eventCategory: "Track" | "Field" | "Relay",
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
