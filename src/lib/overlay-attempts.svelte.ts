import type { OverlayEntry } from "$lib/components/overlay/overlay";

export const overlayAttemptIdleMs = 15_000;

// A poll with identical results must not keep details open. Include every
// attempt's contents, so a foul or an edit to a preallocated slot also reopens it.
export function createOverlayAttempts(
  entries: () => OverlayEntry[],
  identity: () => string,
) {
  const key = $derived(
    JSON.stringify([
      identity(),
      entries()
        .map((entry) => [entry.Id, entry.Result, entry.Attempts])
        .sort((a, b) => Number(a[0]) - Number(b[0])),
    ]),
  );
  const hasAttempts = $derived(
    entries().some((entry) => entry.Attempts?.some((attempt) => attempt.Line1)),
  );
  let expanded = $state(false);
  $effect(() => {
    void key;
    expanded = hasAttempts;
    if (!hasAttempts) return;
    const timer = setTimeout(() => {
      expanded = false;
    }, overlayAttemptIdleMs);
    return () => clearTimeout(timer);
  });
  return {
    get expanded() {
      return expanded;
    },
  };
}
