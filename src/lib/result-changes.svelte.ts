import { untrack } from "svelte";
import { SvelteMap } from "svelte/reactivity";

type Entry = {
  Id: number;
  Result: string | null;
  Attempts?: unknown[] | null;
};

export type ResultChange = {
  // Places gained since the previous update; zero when the rank held or fell.
  gained: number;
  // Index of an attempt added by this update, if any.
  newAttempt?: number;
};

export type LatestAttempt = {
  id: number;
  attempt: number;
  gained: number;
};

const highlightFor = 4000;

// Tracks entries whose result changed between live refreshes. Only entries
// present in consecutive updates are compared, so switching heats or rounds
// never highlights the newly shown list.
export function createResultChanges(entries: () => Entry[]) {
  let previous = new Map<
    number,
    { key: string; rank: number; attempts: string[] }
  >();
  const changes = new SvelteMap<number, ResultChange>();
  const timers = new Map<number, ReturnType<typeof setTimeout>>();
  let latest = $state<LatestAttempt | null>(null);

  $effect(() => {
    const next = new Map<
      number,
      { key: string; rank: number; attempts: string[] }
    >();
    entries().forEach((entry, rank) => {
      const attempts =
        entry.Attempts?.map((attempt) => JSON.stringify(attempt)) ?? [];
      const key = JSON.stringify([entry.Result, attempts]);
      next.set(entry.Id, { key, rank, attempts });
      const before = previous.get(entry.Id);
      if (!before || before.key === key) return;
      const gained = Math.max(0, before.rank - rank);
      // Some feeds preallocate empty slots, and non-best marks do not change
      // Result. Compare slot contents, not just the array length.
      const changedIndex =
        attempts.length >= before.attempts.length
          ? attempts.findLastIndex(
              (attempt, index) => attempt !== before.attempts[index],
            )
          : -1;
      const newAttempt = changedIndex >= 0 ? changedIndex : undefined;
      changes.set(entry.Id, { gained, newAttempt });
      if (newAttempt !== undefined)
        latest = { id: entry.Id, attempt: newAttempt, gained };
      clearTimeout(timers.get(entry.Id));
      timers.set(
        entry.Id,
        setTimeout(() => {
          changes.delete(entry.Id);
          timers.delete(entry.Id);
        }, highlightFor),
      );
    });
    if (untrack(() => latest && !next.has(latest.id))) latest = null;
    previous = next;
  });

  $effect(() => () => timers.forEach(clearTimeout));

  return {
    get: (id: number) => changes.get(id),
    // The most recent attempt observed while viewing; null until one arrives.
    get latest() {
      return latest;
    },
  };
}
