<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { ChevronsUpDown } from "@lucide/svelte";
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { cn } from "$lib/utils";
  import type { EventWithDate } from "$lib/events";

  import {
    competitionEventLink,
    findSelectedEvent,
  } from "$lib/competition-selection";

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

  const statusDots: Record<string, string> = {
    Unallocated: "bg-muted-foreground/40",
    Allocated: "bg-sky-500",
    Progress: "bg-red-500",
    Official: "bg-emerald-500",
  };

  const eventStatusLabel: Record<string, string> = {
    Unallocated: "Eräjaot puuttuvat",
    Allocated: "Eräjaot tehty",
    Progress: "Käynnissä",
    Official: "Tulokset valmiit",
  };

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

  // The date only tells events apart in a competition lasting several days.
  const multipleDays = $derived(
    new Set(sortedEvents.map((event) => event.date)).size > 1,
  );

  const currentEvent = $derived(
    findSelectedEvent(events, currentEventId, roundFromUrl),
  );

  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);

  let open = $state(false);

  function handleSelect(value: string) {
    trigger("selection");
    const event = sortedEvents[Number(value)];
    if (!event) return;
    const url = competitionEventLink(competitionId, event);
    open = false;
    void goto(url);
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger
    class="toolbar-control motion-control min-w-0 max-w-full justify-start px-3 font-normal text-sm max-sm:w-full"
  >
    {#if currentEvent}
      <span class="truncate font-semibold sm:overflow-visible"
        >{currentEvent.EventName}</span
      >
      <span class="truncate text-muted-foreground sm:overflow-visible"
        >{currentEvent.Name}</span
      >
    {:else}
      <span class="truncate font-semibold">Valitse laji</span>
    {/if}
    <ChevronsUpDown
      class="ml-auto size-3.5 shrink-0 text-muted-foreground"
      aria-hidden="true"
    />
  </Popover.Trigger>
  <Popover.Content
    class="max-h-96 w-[min(420px,calc(100vw-2rem))] overflow-auto p-1.5"
    align="start"
  >
    {#each sortedEvents as event, i (`${event.Id}-${event.BeginDateTimeWithTZ}`)}
      {@const selected =
        event.EventId === Number(currentEventId) &&
        event.Name === currentEvent?.Name}
      <button
        aria-current={selected ? "true" : undefined}
        class={cn(
          "grid w-full cursor-pointer grid-cols-[3rem_minmax(0,1fr)_8.25rem] items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary",
          selected && "bg-accent",
        )}
        onclick={() => handleSelect(i.toString())}
      >
        <span class="text-[13px] text-muted-foreground tabular-nums">
          {formatTime(event.BeginDateTimeWithTZ)}
          {#if multipleDays}<span class="block text-[11px]">{event.date}</span
            >{/if}
        </span>
        <span class="truncate"
          ><span class="font-medium">{event.EventName}</span>
          <span class="text-muted-foreground">{event.Name}</span></span
        >
        <span
          class="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground text-xs"
        >
          <span
            class={cn(
              "size-1.5 rounded-full",
              statusDots[event.Status] ?? "bg-muted-foreground/40",
            )}
            aria-hidden="true"
          ></span>
          {eventStatusLabel[event.Status] || event.Status}
        </span>
      </button>
    {/each}
  </Popover.Content>
</Popover.Root>
