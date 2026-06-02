//#region src/lib/results.ts
var INVALID_RESULTS = [
	"DNS",
	"DQ",
	"DNF",
	"DSQ",
	"NH",
	"NM"
];
var SPRINT_RE = /^(\d+),(\d{2})$/;
var DISTANCE_RE = /^(\d+)\.(\d{2}),(\d{2})$/;
function parseFinishTimeToMs(value) {
	let match = value.match(SPRINT_RE);
	if (match) {
		const seconds = Number(match[1]);
		const hundredths = Number(match[2]);
		return seconds * 1e3 + hundredths * 10;
	}
	match = value.match(DISTANCE_RE);
	if (match) {
		const minutes = Number(match[1]);
		const seconds = Number(match[2]);
		const hundredths = Number(match[3]);
		return minutes * 6e4 + seconds * 1e3 + hundredths * 10;
	}
	return null;
}
function parseResult(value, eventCategory) {
	if (!value) return 0;
	if (INVALID_RESULTS.includes(value)) return -1;
	if (eventCategory === "Track" || eventCategory === "Relay") {
		const finishTime = parseFinishTimeToMs(value);
		if (finishTime === null) return 0;
		return finishTime;
	}
	const num = Number(value.replace(",", "."));
	return Number.isNaN(num) ? 0 : num;
}
function sortByResult(a, b, eventCategory) {
	const aResult = parseResult(a.Result, eventCategory);
	const bResult = parseResult(b.Result, eventCategory);
	if (aResult === -1 && bResult !== -1) return 1;
	if (bResult === -1 && aResult !== -1) return -1;
	if (aResult > 0 && bResult > 0) return eventCategory === "Field" ? bResult - aResult : aResult - bResult;
	if (aResult > 0 && bResult === 0) return -1;
	if (bResult > 0 && aResult === 0) return 1;
	const aHasAttempts = (a.Attempts?.length ?? 0) > 0;
	const bHasAttempts = (b.Attempts?.length ?? 0) > 0;
	if (aHasAttempts && !bHasAttempts) return -1;
	if (bHasAttempts && !aHasAttempts) return 1;
	return 0;
}
//#endregion
export { sortByResult as t };
