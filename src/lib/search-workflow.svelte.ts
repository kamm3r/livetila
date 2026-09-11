import { createQuery } from "@tanstack/svelte-query";
import { competitionQueries } from "./competition-data.svelte";
import {
  competitionEventLink,
  isCompetitionLink,
} from "./competition-selection";
import { flattenEvents } from "./events";
import type { CompetitionList, EventList } from "~/types/comp";

export type RecentSearch = { id: string; label: string; url: string };
export type SearchEvent = EventList & { Date: string; Time: string };
const historyKey = "livetila:recent-searches";

// Instantiated inside the rendering adapter's Svelte lifecycle. Browser storage
// is attached after mount; navigation is supplied by the caller.
export class SearchWorkflow {
  query = $state("");
  selectedComp = $state<CompetitionList | null>(null);
  navigatingTo = $state<number | null>(null);
  private recent = $state<RecentSearch[]>([]);
  private storage?: Pick<Storage, "getItem" | "setItem">;
  private competitionsQuery = createQuery(() =>
    competitionQueries.competitions(),
  );
  private eventsQuery = createQuery(() =>
    competitionQueries.events(this.selectedComp?.Id.toString()),
  );

  step = $derived(this.selectedComp ? "events" : "competitions");
  matchingRecent = $derived(
    this.selectedComp
      ? []
      : this.recent.filter((item) =>
          item.label.toLowerCase().includes(this.query.trim().toLowerCase()),
        ),
  );
  private activeQuery = $derived(
    this.selectedComp ? this.eventsQuery : this.competitionsQuery,
  );
  isLoading = $derived(this.activeQuery.isPending);
  loadError = $derived(this.activeQuery.isError);
  filteredCompetitions = $derived(
    (this.competitionsQuery.data ?? [])
      .filter((comp) =>
        comp.Name.toLowerCase().includes(this.query.trim().toLowerCase()),
      )
      .sort((a, b) => b.Date.localeCompare(a.Date)),
  );
  filteredEvents = $derived.by<SearchEvent[]>(() => {
    // The selected competition's prefix is not part of the event query, even
    // when its name contains a slash.
    const prefix = this.selectedComp ? `${this.selectedComp.Name} / ` : "";
    const query = this.query.startsWith(prefix)
      ? this.query.slice(prefix.length).trim().toLowerCase()
      : "";
    return flattenEvents(this.eventsQuery.data ?? {})
      .filter((event) => event.EventName.toLowerCase().includes(query))
      .sort((a, b) =>
        a.BeginDateTimeWithTZ.localeCompare(b.BeginDateTimeWithTZ),
      )
      .map((event) => {
        const date = new Date(event.BeginDateTimeWithTZ);
        return {
          ...event,
          Date: `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.`,
          Time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
        };
      });
  });
  results = $derived(
    this.selectedComp ? this.filteredEvents : this.filteredCompetitions,
  );
  hasResults = $derived(this.results.length > 0);
  private batchSize = $derived(this.selectedComp ? 15 : 10);
  visibleCount = $derived.by(() => {
    void this.query;
    void this.selectedComp;
    return this.batchSize;
  });
  hasMore = $derived(this.visibleCount < this.results.length);

  constructor(private navigate: (url: string) => Promise<unknown>) {}

  restoreHistory(storage: Pick<Storage, "getItem" | "setItem">) {
    this.storage = storage;
    try {
      const saved: unknown = JSON.parse(storage.getItem(historyKey) ?? "[]");
      if (!Array.isArray(saved)) return;
      this.recent = saved
        .filter(
          (item): item is RecentSearch =>
            item &&
            typeof item.id === "string" &&
            typeof item.label === "string" &&
            typeof item.url === "string" &&
            isCompetitionLink(item.url),
        )
        .map((item) => ({ ...item, id: item.url }))
        .filter(
          (item, index, all) =>
            all.findIndex((other) => other.url === item.url) === index,
        )
        .slice(0, 4);
    } catch {
      // Invalid or unavailable storage must not prevent searching.
    }
  }

  private saveHistory() {
    try {
      this.storage?.setItem(historyKey, JSON.stringify(this.recent));
    } catch {
      /* Storage may be disabled or full. */
    }
  }

  private remember(item: RecentSearch) {
    this.recent = [
      item,
      ...this.recent.filter((previous) => previous.url !== item.url),
    ].slice(0, 4);
    this.saveHistory();
  }

  removeRecent(id: string) {
    this.recent = this.recent.filter((item) => item.id !== id);
    this.saveHistory();
  }

  input(value: string) {
    this.query = value;
    if (this.selectedComp && !value.startsWith(`${this.selectedComp.Name} /`)) {
      this.selectedComp = null;
      this.query = "";
    }
  }

  selectCompetition(comp: CompetitionList) {
    this.selectedComp = comp;
    this.query = `${comp.Name} / `;
  }

  loadMore() {
    this.visibleCount = Math.min(
      this.visibleCount + this.batchSize,
      this.results.length,
    );
  }

  retry() {
    return this.activeQuery.refetch();
  }

  async selectEvent(event: SearchEvent) {
    if (!this.selectedComp || this.navigatingTo !== null) return;
    const url = competitionEventLink(this.selectedComp.Id, event);
    this.navigatingTo = event.Id;
    this.remember({
      id: url,
      url,
      label: `${this.selectedComp.Name} / ${event.EventName} / ${event.Name}`,
    });
    try {
      await this.navigate(url);
    } finally {
      this.navigatingTo = null;
    }
  }

  async selectRecent(item: RecentSearch) {
    if (!isCompetitionLink(item.url) || this.navigatingTo !== null) return;
    this.navigatingTo = -1;
    this.remember(item);
    try {
      await this.navigate(item.url);
    } finally {
      this.navigatingTo = null;
    }
  }
}
