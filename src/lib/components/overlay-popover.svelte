<script lang="ts">
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  import { ArrowUpRight, Cast, X } from "@lucide/svelte";
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
    PopoverClose,
  } from "$lib/components/ui/popover";
  import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
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
          records: offered("records") ? features.records : undefined,
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
    <legend class="mb-1.5 font-medium text-ui">{legend}</legend>
    <div class="flex flex-wrap gap-1 rounded-lg bg-muted p-[3px]">
      {#each options as option (option.value)}
        <label
          class={cn(
            "flex-auto cursor-pointer whitespace-nowrap rounded-md px-2 py-1 text-center sm:flex-1 font-medium text-muted-foreground text-ui hover:text-foreground has-focus-visible:outline-2 has-focus-visible:outline-primary",
            // Selected as in the app's round switcher.
            selected === option.value &&
              "bg-card text-primary shadow-xs hover:text-primary",
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

<!-- The style comes first and stays put whichever style is picked. -->
{#snippet styleControl()}
  {@render segmented(
    "graphic-style",
    "Tyyli",
    linkStyles.map((item) => ({ value: item.id, label: item.label })),
    style,
    (value) => (style = value as LinkStyle),
  )}
{/snippet}

{#snippet settings()}
  {#if available.length > 0}
    <fieldset class="flex flex-col gap-3">
      <legend class="sr-only">Asetukset</legend>
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
            class="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-input transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-background after:shadow-xs after:transition-transform peer-checked:bg-primary dark:peer-checked:bg-[oklch(0.53_0.13_242)] dark:after:bg-white peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-focus-visible:outline-offset-2"
          ></span>
          <span class="flex flex-col gap-0.5">
            <span class="font-medium text-sm">{feature.label}</span>
            <span class="text-pretty text-muted-foreground text-ui">
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
        Avaa grafiikka
        <ArrowUpRight data-icon="inline-end" />
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
  <div class="flex flex-col gap-1.5">
    <p class="font-medium text-ui">Esimerkki</p>
    <OverlayExplainer
      {features}
      context={featureContext}
      {labels}
      athletes={exampleAthletes}
      {events}
      {eventCategory}
      {wide}
    />
  </div>
{/snippet}

{#if isMobile}
  <Drawer {open} onOpenChange={handleOpenChange}>
    <DrawerTrigger
      aria-label="Lähetysgrafiikka"
      class="toolbar-control motion-control -mr-2.5 size-9 border-transparent bg-transparent text-muted-foreground shadow-none hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground sm:hidden"
    >
      <Cast class="size-4" aria-hidden="true" />
    </DrawerTrigger>
    <DrawerContent class="data-[vaul-drawer-direction=bottom]:max-h-[90vh]">
      <DrawerHeader
        class="relative pr-12 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left"
      >
        <DrawerClose
          aria-label="Sulje"
          class="absolute top-3 right-3 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          ><X class="size-4" aria-hidden="true" /></DrawerClose
        >
        <DrawerTitle class="font-semibold text-lg">Lähetysgrafiikka</DrawerTitle
        >
        <DrawerDescription>
          Tulokset lähetykseen OBS:n tai muun ohjelman selainlähteenä.
        </DrawerDescription>
      </DrawerHeader>
      <div class="flex flex-col gap-5 overflow-y-auto px-4 pt-2 pb-8">
        {@render styleControl()}
        {@render preview(false)}
        {@render settings()}
      </div>
    </DrawerContent>
  </Drawer>
{:else}
  <Popover {open} onOpenChange={handleOpenChange}>
    <PopoverTrigger
      aria-label="Lähetysgrafiikka"
      class="toolbar-control motion-control -mr-2.5 whitespace-nowrap border-transparent bg-transparent px-2.5 text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground data-[state=open]:text-primary max-sm:hidden"
    >
      <Cast class="size-4" aria-hidden="true" />
      Grafiikka
    </PopoverTrigger>
    <PopoverContent
      align="end"
      alignOffset={10}
      class="flex max-h-[calc(var(--bits-popover-content-available-height)-1rem)] w-[44rem] max-w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0"
    >
      <!-- The header stays put; only the settings below it scroll. -->
      <PopoverHeader class="relative shrink-0 border-b p-4 pr-12">
        <PopoverClose
          aria-label="Sulje"
          class="absolute top-3 right-3 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          ><X class="size-4" aria-hidden="true" /></PopoverClose
        >
        <PopoverTitle class="font-semibold text-base"
          >Lähetysgrafiikka</PopoverTitle
        >
        <PopoverDescription>
          Tulokset lähetykseen OBS:n tai muun ohjelman selainlähteenä.
        </PopoverDescription>
      </PopoverHeader>
      <!-- Every style stacks the same way, so switching moves nothing. -->
      <div
        class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 [scrollbar-gutter:stable] [scrollbar-width:thin]"
      >
        {@render styleControl()}
        {@render preview(true)}
        <div class="flex flex-col gap-4">{@render settings()}</div>
      </div>
    </PopoverContent>
  </Popover>
{/if}
