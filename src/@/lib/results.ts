const INVALID_RESULTS = ["DNS", "DQ", "DNF", "DSQ"] as const;

function parseFinishTimeToMs(value: string): number | null {
  // Sprint: ss,hh  (9,58)
  let match = value.match(/^(\d+),(\d{2})$/);
  if (match) {
    const seconds = Number(match[1]);
    const hundredths = Number(match[2]);
    return seconds * 1000 + hundredths * 10;
  }

  // Distance: m.ss,hh  (3.05,10)
  match = value.match(/^(\d+)\.(\d{2}),(\d{2})$/);
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

  // Sprint format: ss,hh
  const sprintMatch = value.match(/^(\d),(\d{2})$/);
  if (sprintMatch) {
    const seconds = sprintMatch[1];
    const hundredths = sprintMatch[2];
    return `0${seconds},${hundredths}`;
  }

  return value;
}

export function parseResult(
  value: string | null,
  eventCategory: "Track" | "Field",
): number {
  if (!value || value === "NM") return 0;
  if (INVALID_RESULTS.includes(value as (typeof INVALID_RESULTS)[number])) {
    return -1;
  }
  if (eventCategory === "Track") {
    const finishTime = parseFinishTimeToMs(value);
    if (finishTime === null) return 0;
    return finishTime;
  }
  const num = Number(value.replace(",", "."));
  return Number.isNaN(num) ? 0 : num;
}

export function sortByResult<T extends { Result: string | null }>(
  a: T,
  b: T,
  eventCategory: "Track" | "Field",
): number {
  const aResult = parseResult(a.Result, eventCategory);
  const bResult = parseResult(b.Result, eventCategory);

  if (aResult === -1 && bResult !== -1) return 1;
  if (bResult === -1 && aResult !== -1) return -1;
  if (aResult === 0 && bResult !== 0) return 1;
  if (bResult === 0 && aResult !== 0) return -1;
  return eventCategory === "Field" ? bResult - aResult : aResult - bResult;
}
