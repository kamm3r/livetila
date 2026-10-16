<script lang="ts">
  // A looping example of the broadcast graphic for the link popover: the
  // chosen style on example data, shaped like the event it is opened from.
  import type {
    OverlayFeatureContext,
    OverlayFeatureState,
  } from "$lib/overlay-features";
  import ExplainerFrame, {
    type ExplainerLabels,
  } from "./obs-explainer-frame.svelte";
  import { buildExample, exampleKind } from "$lib/overlay-example";
  import { isVerticalJump } from "$lib/results";
  import type { Allocation, EventCategory } from "~/types/comp";
  import type { EventWithDate } from "$lib/events";

  let {
    features,
    context,
    labels,
    eventCategory = "Field",
    athletes: real = [],
    events = [],
    wide = false,
  }: {
    features: OverlayFeatureState;
    context: OverlayFeatureContext;
    labels: ExplainerLabels;
    eventCategory?: EventCategory;
    // The competition's athletes in protocol order; the first ones replace
    // the example names.
    athletes?: Allocation[];
    events?: EventWithDate[];
    // The popover's two-column layout, with room for a larger example.
    wide?: boolean;
  } = $props();

  const style = $derived(context.style);
  // The boards are wide, the list narrow.
  const board = $derived(
    style === "broadcast-results" || style === "timetable",
  );
  const zoom = $derived(board ? (wide ? 0.85 : 0.5) : wide ? 1 : 0.85);
  // The loop: the first change, then the second, held so it can be read.
  const steps = 3;
  const stepFor = 4000;

  // The example takes the shape of the event: marks, heights or times.
  const kind = $derived(
    exampleKind(eventCategory, labels.eventName, isVerticalJump(real)),
  );
  const build = (phase: number) =>
    buildExample(kind, labels.eventName ?? "", phase, real);

  let tick = $state(0);
  let cycle = $state(0);
  const step = $derived(tick % steps);
  $effect(() => {
    const timer = setInterval(() => {
      if (step < steps - 1) tick = step + 1;
      else {
        tick = 0;
        cycle += 1;
      }
    }, stepFor);
    return () => clearInterval(timer);
  });

  // Each loop rewinds to its starting point: in the field the rows slide back
  // and the first athlete of the run opens, on the track the times clear.
  // Once that has settled, the first change arrives; the second comes with
  // step 1.
  let warm = $state(false);
  $effect(() => {
    void cycle;
    warm = false;
    const timer = setTimeout(() => (warm = true), 1200);
    return () => clearTimeout(timer);
  });
  // The results board shows the final standings; its entrance plays once.
  const entries = $derived(
    style === "broadcast-results"
      ? build(2)
      : build(!warm ? 0 : step === 0 ? 1 : 2),
  );

  // A restarting loop opens its series from zero height; holding the
  // tallest size seen keeps the popover from jumping.
  // Each style has its own size, so each keeps its own tallest. The
  // measured box is rebuilt per style, so a size is never credited to the
  // wrong one.
  let tallest = $state<Record<string, number>>({});
  function measure(key: string, height?: number | null) {
    if (height && height > (tallest[key] ?? 0)) tallest[key] = height;
  }
</script>

<div class="flex flex-col gap-3" aria-hidden="true">
  <div
    class="overflow-hidden rounded-lg bg-linear-to-br from-[#2f5a3a] via-[#6f9a5a] to-[#b9774a] p-3"
  >
    {#key style}
      <div
        class="flex items-start justify-center"
        style:min-height="{tallest[style] ?? 0}px"
        bind:offsetHeight={null, (height) => measure(style, height)}
      >
        <ExplainerFrame
          {style}
          {zoom}
          {entries}
          {labels}
          {cycle}
          {events}
          {eventCategory}
          gaps={features.gap}
        />
      </div>
    {/key}
  </div>
</div>
