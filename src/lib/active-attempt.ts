import type { Heat, Round } from "~/types/comp";

// Only trust explicit upstream selection; never infer activity from result order.
export function activeAllocationIds(round?: Round, heat?: Heat): Set<number> {
  if (round?.Status !== "Progress") return new Set();
  return new Set(
    (heat ? [heat] : round.Heats).flatMap((item) => {
      const id = item.ActiveAllocationId;
      return id && id > 0 && (item.ActiveAllocationAttemptIndex ?? -1) >= 0
        ? [id]
        : [];
    }),
  );
}
