<script lang="ts">
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  import { Cast, ExternalLink } from "@lucide/svelte";
  import { getRoundContext } from "./round-provider.svelte";
  import Embed from "./embed.svelte";
  import OverlayExplainer from "./overlay-explainer.svelte";
  import OverlaySetup from "./overlay-setup.svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverDescription,
  } from "$lib/components/ui/popover";
  import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
  } from "$lib/components/ui/drawer";

  import { overlayLink } from "$lib/competition-selection";
  import { cn } from "$lib/utils";
  import type { EventWithDate } from "$lib/events";
  import type { EventCategory } from "~/types/comp";
  import { isTimed, protocolOrder } from "$lib/results";
  import {
    activeFeatures,
    defaultFeatureState,
    linkStyles,
    overlayFeatures,
    type LinkStyle,
    type OverlayFeatureId,
  } from "$lib/overlay-features";

  let {
    slug,
    competitionName,
    eventName,
    events = [],
    eventCategory = "Field",
  }: {
    slug: string;
    competitionName?: string;
    eventName?: string;
    // The competition's events, for the timetable example.
    events?: EventWithDate[];
    eventCategory?: EventCategory;
  } = $props();

  const ctx = getRoundContext();
  let origin = $state("");
  let style = $state<LinkStyle>("broadcast-trail-plain");
  let featureState = $state(defaultFeatureState());
  const round = $derived(
    ctx.rounds.find((item) => item.Index === ctx.selectedRound),
  );
  const heats = $derived(round?.Heats ?? []);
  const featureContext = $derived({
    heatCount: heats.length,
    style,
    timed: isTimed(eventCategory),
  });
  const available = $derived(
    overlayFeatures.filter((feature) => feature.available(featureContext)),
  );
  const features = $derived(activeFeatures(featureState, featureContext));
  const offered = (id: OverlayFeatureId) =>
    available.some((feature) => feature.id === id);

  // With heats apart, the heat to show; the page's own heat to begin with.
  let chosenHeat = $state<number | null>(null);
  const heat = $derived(
    heats.find((item) => item.Index === (chosenHeat ?? ctx.selectedHeat)) ??
      heats[0],
  );
  const heatNumber = $derived(heat ? heats.indexOf(heat) + 1 : 0);

  // The athletes the graphic would show; without any there is nothing to link.
  const athleteCount = $derived(
    features.heats
      ? (heat?.Allocations.length ?? 0)
      : heats.reduce((sum, item) => sum + item.Allocations.length, 0),
  );
  const linkable = $derived(style === "timetable" || athleteCount > 0);

  // The preview carries the same titles the graphic will show.
  const labels = $derived({
    competitionName,
    eventName,
    roundName: round?.Name,
    heatLabel:
      features.heats && heatNumber > 0
        ? `Erä ${heatNumber}/${heats.length}`
        : undefined,
  });
  // The example uses this competition's athletes, first in protocol order.
  const exampleAthletes = $derived(
    protocolOrder(ctx.heats).flatMap((item) => item.allocations),
  );
  const overlayUrl = $derived(
    origin +
      overlayLink(
        slug,
        ctx.rounds,
        {
          round: ctx.selectedRound,
          // Without a heat the graphic lists the whole round.
          heat: features.heats ? (heat?.Index ?? -1) : -1,
        },
        {
          style,
          // A feature that does not apply leaves the link alone.
          gap: offered("gap") ? features.gap : undefined,
        },
      ),
  );

  let open = $state(false);
  let isMobile = $state(false);

  $effect(() => {
    origin = window.location.origin;
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => {
      isMobile = mq.matches;
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  });
  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);
  function handleOpenChange(newOpen: boolean) {
    trigger("selection");
    open = newOpen;
  }
</script>

<!-- A row of choices that reads as one control, one of them picked. -->
{#snippet segmented(
  name: string,
  legend: string,
  options: { value: string; label: string }[],
  selected: string,
  pick: (value: string) => void,
)}
  <fieldset class="flex flex-col gap-1.5">
    <legend class="mb-1.5 font-medium text-sm">{legend}</legend>
    <div class="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
      {#each options as option (option.value)}
        <label
          class={cn(
            "flex-1 cursor-pointer whitespace-nowrap rounded-md px-2 py-1 text-center text-muted-foreground text-xs has-focus-visible:outline-2 has-focus-visible:outline-primary",
            selected === option.value &&
              "bg-background text-foreground shadow-xs",
          )}
        >
          <input
            type="radio"
            {name}
            value={option.value}
            checked={selected === option.value}
            onchange={() => pick(option.value)}
            class="sr-only"
          />
          {option.label}
        </label>
      {/each}
    </div>
  </fieldset>
{/snippet}

{#snippet settings()}
  {@render segmented(
    "graphic-style",
    "Tyyli",
    linkStyles.map((item) => ({ value: item.id, label: item.label })),
    style,
    (value) => (style = value as LinkStyle),
  )}

  {#if available.length > 0}
    <fieldset class="flex flex-col gap-3">
      <legend class="mb-1.5 font-medium text-sm">Asetukset</legend>
      {#each available as feature (feature.id)}
        <label class="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            role="switch"
            bind:checked={featureState[feature.id]}
            class="peer sr-only"
          />
          <span
            aria-hidden="true"
            class="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-input transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-background after:shadow-xs after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2"
          ></span>
          <span class="flex flex-col gap-0.5">
            <span class="font-medium text-sm">{feature.label}</span>
            <span class="text-muted-foreground text-xs">
              {feature.description(featureContext)}
            </span>
          </span>
        </label>
      {/each}
    </fieldset>
  {/if}

  {#if features.heats}
    {@render segmented(
      "graphic-heat",
      "Erä",
      heats.map((item, i) => ({
        value: String(item.Index),
        label: String(i + 1),
      })),
      String(heat?.Index ?? ""),
      (value) => (chosenHeat = Number(value)),
    )}
  {/if}

  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <div class="flex-1"><Embed url={overlayUrl} disabled={!linkable} /></div>
      <Button
        variant="outline"
        href={overlayUrl}
        target="_blank"
        rel="noopener"
        disabled={!linkable}
        class="gap-2 aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        <ExternalLink data-icon="inline-start" />
        Avaa grafiikka
      </Button>
    </div>
    {#if !linkable}
      <p class="text-muted-foreground text-xs">
        {features.heats ? "Erässä" : "Kierroksella"} ei ole vielä urheilijoita.
      </p>
    {/if}
  </div>
  <OverlaySetup />
{/snippet}

{#snippet preview(wide: boolean)}
  <OverlayExplainer
    {features}
    context={featureContext}
    {labels}
    athletes={exampleAthletes}
    {events}
    {eventCategory}
    {wide}
  />
{/snippet}

{#if isMobile}
  <Drawer {open} onOpenChange={handleOpenChange}>
    <DrawerTrigger
      aria-label="Lähetysgrafiikka"
      class="sm:hidden inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none select-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary motion-control"
    >
      <Cast class="size-4" aria-hidden="true" />
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Lähetysgrafiikka</DrawerTitle>
        <DrawerDescription>
          Tulokset lähetykseen OBS:n tai muun ohjelman selainlähteenä.
        </DrawerDescription>
      </DrawerHeader>
      <div class="flex flex-col gap-5 overflow-y-auto px-4 pt-2 pb-8">
        {@render preview(false)}
        {@render settings()}
      </div>
    </DrawerContent>
  </Drawer>
{:else}
  <Popover {open} onOpenChange={handleOpenChange}>
    <PopoverTrigger
      aria-label="Lähetysgrafiikka"
      class="hidden sm:inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 font-medium text-[13px] text-muted-foreground outline-none select-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary motion-control"
    >
      <Cast class="size-4" aria-hidden="true" />
      Grafiikka
    </PopoverTrigger>
    <PopoverContent
      align="end"
      class="max-h-[calc(100dvh-6rem)] w-[44rem] max-w-[calc(100vw-2rem)] overflow-y-auto p-0"
    >
      <PopoverHeader class="border-b p-4">
        <PopoverTitle>Lähetysgrafiikka</PopoverTitle>
        <PopoverDescription>
          Tulokset lähetykseen OBS:n tai muun ohjelman selainlähteenä.
        </PopoverDescription>
      </PopoverHeader>
      <!-- The list's preview column matches the graphic's width at full size;
           the wider styles take the full width above the settings. -->
      <div
        class={cn(
          "grid items-start gap-5 p-4",
          style === "broadcast-trail-plain" && "grid-cols-[19.5rem_1fr]",
        )}
      >
        {@render preview(true)}
        <div class="flex flex-col gap-5">{@render settings()}</div>
      </div>
    </PopoverContent>
  </Popover>
{/if}
