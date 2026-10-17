<script lang="ts" module>
  export type ExplainerLabels = {
    competitionName?: string;
    eventName?: string;
    roundName?: string;
    heatLabel?: string;
  };
</script>

<script lang="ts">
  // The real overlay on example data. A new `cycle` rewinds the data in place
  // so the loop runs on without a cut.
  import { untrack } from "svelte";
  import { createResultChanges } from "$lib/result-changes.svelte";
  import type { LinkStyle } from "$lib/overlay-features";
  import BroadcastFrame from "./overlay/broadcast-frame.svelte";
  import BroadcastResults from "./overlay/broadcast-results.svelte";
  import Ticker from "./overlay/ticker.svelte";
  import Timetable from "./overlay/timetable.svelte";
  import type { EventWithDate } from "$lib/events";
  import type { EventCategory } from "~/types/comp";
  import type { OverlayEntry, OverlayView } from "./overlay/overlay";

  let {
    entries,
    zoom,
    gaps,
    labels,
    cycle,
    style,
    events,
    eventCategory,
  }: {
    entries: OverlayEntry[];
    zoom: number;
    gaps: boolean;
    labels: ExplainerLabels;
    cycle: number;
    style: LinkStyle;
    events: EventWithDate[];
    eventCategory: EventCategory;
  } = $props();

  const tracked = createResultChanges(() => entries);
  // The athlete who competed last before the rewind. Forgetting them lets
  // the overlay focus the athlete who starts the next run.
  const rewoundFrom = $derived.by(() => {
    void cycle;
    return untrack(() => tracked.latest);
  });
  const changes = {
    // The rewind changes marks too; only new attempts count as changes.
    get: (id: number) => {
      const change = tracked.get(id);
      return change?.newAttempt === undefined ? undefined : change;
    },
    get latest() {
      return tracked.latest === rewoundFrom ? null : tracked.latest;
    },
  };
  const view: OverlayView = $derived({
    entries,
    eventCategory,
    // The competition's own titles, with example ones while they load.
    eventName: labels.eventName ?? "M Keihäs",
    roundName: labels.roundName ?? "Loppukilpailu",
    competitionName: labels.competitionName ?? "Esimerkki",
    heatLabel: labels.heatLabel,
    isLoading: false,
    isRefreshError: false,
    changes,
  });
</script>

{#if style === "ticker"}
  <!-- The ticker pins itself to the bottom of the screen; the transform makes
       this box its screen. -->
  <div class="relative h-36 w-full transform-[translateZ(0)]">
    <Ticker {view} inHeat={false} />
  </div>
{:else if style === "timetable"}
  <div style:zoom class="w-[44rem]">
    <Timetable {events} competitionName={view.competitionName} />
  </div>
{:else if style === "broadcast-results"}
  <div style:zoom class="w-[44rem]">
    <BroadcastResults {view} inHeat={false} {gaps} />
  </div>
{:else}
  <div style:zoom>
    <BroadcastFrame {view} inHeat={false} {gaps} />
  </div>
{/if}
