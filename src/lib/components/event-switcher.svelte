<script lang="ts">
  import { Calendar, Clock } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { triggerHaptic } from "$lib/hooks/use-haptics";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import { cn } from "$lib/utils";
  import type { EventWithDate } from "$lib/events";

  let {
    competitionId,
    events = [],
    currentEventId,
    roundFromUrl,
  }: {
    competitionId: string;
    events: EventWithDate[];
    currentEventId: string;
    roundFromUrl?: string | null;
  } = $props();

  const roundMapping = {
    Qualify: "Alkuerät",
    Final: "Loppukilpailu",
  } as const;

  type RoundKey = keyof typeof roundMapping;

  const statusVariants: Record<string, string> = {
    Unallocated: "unallocated",
    Allocated: "allocated",
    Progress: "progress",
    Official: "official",
  };

  const eventStatusLabel: Record<string, string> = {
    Unallocated: "Eräjaot puuttuvat",
    Allocated: "Eräjaot tehty",
    Progress: "Käynnissä",
    Official: "Tulokset valmiit",
  };

  let isOpen = $state(false);

  function eventNameToRoundCase(name: string): RoundKey | undefined {
    return (Object.entries(roundMapping) as [string, string][]).find(
      ([, v]) => v === name,
    )?.[0] as RoundKey | undefined;
  }

  function hasMultipleRoundsForEvent(eventName: string): boolean {
    const rounds = new Set<string>();
    for (const event of events) {
      if (event.EventName === eventName) {
        const round = eventNameToRoundCase(event.Name);
        if (round) {
          rounds.add(round);
          if (rounds.size > 1) return true;
        }
      }
    }
    return false;
  }

  const timeFormatter = new Intl.DateTimeFormat("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  });

  function formatTime(date: string): string {
    return timeFormatter.format(new Date(date));
  }

  const currentEvent = $derived(
    roundFromUrl
      ? events.find(
            (e) =>
              e.EventId === Number(currentEventId) &&
              eventNameToRoundCase(e.Name) === roundFromUrl,
          ) ?? events.find((e) => e.EventId === Number(currentEventId))
      : events.find((e) => e.EventId === Number(currentEventId)),
  );

  function handleSelect(value: string) {
    triggerHaptic("selection");
    const event = events[Number(value)];
    if (!event) return;
    const roundCase = eventNameToRoundCase(event.Name);
    const hasMultiple = hasMultipleRoundsForEvent(event.EventName);

    let url = `/competition/${competitionId}-${event.EventId}`;
    if (hasMultiple && roundCase) {
      url += `?round=${roundCase}`;
    }
    goto(url);
    isOpen = false;
  }

  function handleOverlayKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      isOpen = false;
    }
  }
</script>

<div class="relative">
  <button
    class="flex w-full items-center rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[400px]"
    onclick={() => (isOpen = !isOpen)}
  >
    {#if currentEvent}
      <div class="flex w-full items-center justify-between gap-2">
        <div class="flex flex-col gap-2">
          <span>{currentEvent.EventName} {currentEvent.Name}</span>
          <Badge variant={statusVariants[currentEvent.Status] || "default"}>
            {eventStatusLabel[currentEvent.Status] || currentEvent.Status}
          </Badge>
        </div>
        <div
          class="flex min-w-[90px] flex-col items-end gap-2 text-muted-foreground text-xs"
        >
          <span class="flex items-center gap-1"
            >{formatTime(currentEvent.BeginDateTimeWithTZ)}
            <Clock class="size-3" /></span
          >
          <span class="flex items-center gap-1"
            >{currentEvent.date} <Calendar class="size-3" /></span
          >
        </div>
      </div>
    {/if}
  </button>

  {#if isOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="fixed inset-0 z-40"
      role="button"
      tabindex="-1"
      aria-label="Sulje valikko"
      onclick={() => (isOpen = false)}
      onkeydown={handleOverlayKeydown}
    ></div>

    <div
      class="absolute left-0 right-0 z-50 mt-1 max-h-96 min-w-[8rem] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md sm:w-[400px]"
      role="listbox"
    >
      {#each events as event, i}
        <button
          class={cn(
            "flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
            event.EventId === Number(currentEventId) &&
              event.Name === currentEvent?.Name &&
              "bg-accent",
          )}
          onclick={() => handleSelect(i.toString())}
        >
          <div class="flex w-full items-center justify-between gap-2">
            <div class="flex flex-col gap-1">
              <span>{event.EventName} {event.Name}</span>
              <Badge variant={statusVariants[event.Status] || "default"}>
                {eventStatusLabel[event.Status] || event.Status}
              </Badge>
            </div>
            <div
              class="flex min-w-[90px] flex-col items-end gap-1 text-muted-foreground text-xs"
            >
              <span class="flex items-center gap-1"
                >{formatTime(event.BeginDateTimeWithTZ)}
                <Clock class="size-3" /></span
              >
              <span class="flex items-center gap-1"
                >{event.date} <Calendar class="size-3" /></span
              >
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>
