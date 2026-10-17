import { isVerticalJump } from "./results";
import type { Attempt, EventCategory } from "~/types/comp";

type Entry = { Attempts?: Attempt[] | null };

// The API has no attempt-limit field. Standard horizontal jumps and throws
// get six slots (three in combined events); preserve any extra recorded marks.
// Vertical jumps are keyed by height, not by an athlete's array position.
export function attemptLayout(
  entries: Entry[],
  category: EventCategory,
  subCategory?: string,
  combined = false,
) {
  const vertical =
    subCategory === "VerticalJump" || (!subCategory && isVerticalJump(entries));
  if (category !== "Field") return { vertical: false, labels: [] as string[] };
  if (vertical) {
    const heights = new Set(
      entries.flatMap(
        (entry) =>
          entry.Attempts?.map((attempt) => attempt.Line1).filter(Boolean) ?? [],
      ),
    );
    return {
      vertical: true,
      labels: [...heights].sort(
        (a, b) =>
          Number(a.replace(",", ".")) - Number(b.replace(",", ".")) ||
          a.localeCompare(b),
      ),
    };
  }
  const observed = Math.max(
    0,
    ...entries.map((entry) => entry.Attempts?.length ?? 0),
  );
  const series =
    subCategory === "HorizontalJump" || subCategory === "Throw" || observed > 1;
  const count = series ? Math.max(combined ? 3 : 6, observed) : 0;
  return {
    vertical: false,
    labels: Array.from({ length: count }, (_, index) => String(index + 1)),
  };
}
