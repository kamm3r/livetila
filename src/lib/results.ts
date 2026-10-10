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
