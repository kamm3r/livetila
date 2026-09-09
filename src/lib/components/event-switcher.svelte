<script lang="ts">
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { Calendar, Clock } from "@lucide/svelte";
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { Badge, type BadgeVariant } from "$lib/components/ui/badge";
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

  const statusVariants: Record<string, BadgeVariant> = {
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

  const sortedEvents = $derived(
    [...events].sort(
      (a, b) =>
        new Date(a.BeginDateTimeWithTZ).getTime() -
        new Date(b.BeginDateTimeWithTZ).getTime(),
    ),
  );

  const currentEvent = $derived(
    roundFromUrl
      ? (events.find(
          (e) =>
            e.EventId === Number(currentEventId) &&
            eventNameToRoundCase(e.Name) === roundFromUrl,
        ) ?? events.find((e) => e.EventId === Number(currentEventId)))
      : events.find((e) => e.EventId === Number(currentEventId)),
  );

  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);

  let open = $state(false);

  function handleSelect(value: string) {
    trigger("selection");
    const event = sortedEvents[Number(value)];
    if (!event) return;
    const roundCase = eventNameToRoundCase(event.Name);
    const hasMultiple = hasMultipleRoundsForEvent(event.EventName);

    let url = `/competition/${competitionId}-${event.EventId}`;
    if (hasMultiple && roundCase) {
      url += `?round=${roundCase}`;
    }
    open = false;
    void goto(url);
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class={cn(
      buttonVariants({ variant: "outline" }),
      "h-auto px-4 py-2 w-full sm:w-[400px]",
    )}
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
  </Popover.Trigger>
  <Popover.Content
    class="w-[var(--bits-popover-anchor-width)] max-h-96 overflow-auto p-1"
    align="start"
  >
    {#each sortedEvents as event, i (`${event.Id}-${event.BeginDateTimeWithTZ}`)}
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
  </Popover.Content>
</Popover.Root>
