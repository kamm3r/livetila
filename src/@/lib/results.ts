const INVALID_RESULTS = ["DNS", "DQ", "DNF", "DSQ", "NH", "NM"] as const;

function isDns(value: string | null): boolean {
	return value === "DNS";
}

function isInvalidResult(value: string | null): boolean {
	return INVALID_RESULTS.includes(
		value as (typeof INVALID_RESULTS)[number],
	);
}

// Hoisted RegExp patterns (js-hoist-regexp)
const SPRINT_RE = /^(\d+),(\d{2})$/;
const DISTANCE_RE = /^(\d+)\.(\d{2}),(\d{2})$/;
const SPRINT_FORMAT_RE = /^(\d),(\d{2})$/;

function parseFinishTimeToMs(value: string): number | null {
	// Sprint: ss,hh  (9,58)
	let match = value.match(SPRINT_RE);
	if (match) {
		const seconds = Number(match[1]);
		const hundredths = Number(match[2]);
		return seconds * 1000 + hundredths * 10;
	}

	// Distance: m.ss,hh  (3.05,10)
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

	// Sprint format: ss,hh
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
	T extends { Result: string | null; Attempts?: { Line1: string; Line2: string }[] },
>(a: T, b: T, eventCategory: "Track" | "Field" | "Relay"): number {
	const aIsDns = isDns(a.Result);
	const bIsDns = isDns(b.Result);

	// DNS always last of all
	if (aIsDns && !bIsDns) return 1;
	if (bIsDns && !aIsDns) return -1;

	const aIsInvalid = isInvalidResult(a.Result);
	const bIsInvalid = isInvalidResult(b.Result);

	// Other invalid results after valid/empty ones, but before DNS
	if (aIsInvalid && !bIsInvalid) return 1;
	if (bIsInvalid && !aIsInvalid) return -1;

	const aResult = parseResult(a.Result, eventCategory);
	const bResult = parseResult(b.Result, eventCategory);

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
