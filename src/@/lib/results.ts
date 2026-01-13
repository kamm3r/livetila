const INVALID_RESULTS = ["DNS", "DQ", "DNF", "DSQ"] as const;

export function parseResult(value: string | null): number {
	if (!value || value === "NM") return 0;
	if (INVALID_RESULTS.includes(value as (typeof INVALID_RESULTS)[number])) {
		return -1;
	}
	const num = Number(value);
	return Number.isNaN(num) ? 0 : num;
}

export function sortByResult<T extends { Result: string | null }>(
	a: T,
	b: T,
): number {
	const aResult = parseResult(a.Result);
	const bResult = parseResult(b.Result);

	if (aResult === -1 && bResult !== -1) return 1;
	if (bResult === -1 && aResult !== -1) return -1;
	if (aResult === 0 && bResult !== 0) return 1;
	if (bResult === 0 && aResult !== 0) return -1;

	return bResult - aResult;
}
