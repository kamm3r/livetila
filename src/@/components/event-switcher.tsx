"use client";

import { Calendar, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "~/@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/@/components/ui/select";
import type { EventList, Events } from "~/types/comp";

interface EventWithDate extends EventList {
  date: string;
}

type RoundCase = "Qualify" | "Final";

function eventNameToRoundCase(name: string): RoundCase | undefined {
  switch (name) {
    case "Alkuerät":
      return "Qualify";
    case "Loppukilpailu":
      return "Final";
    default:
      return undefined;
  }
}
function hasMultipleRoundsForEvent(events: EventWithDate[], eventName: string) {
  const rounds = new Set(
    events
      .filter((e) => e.EventName === eventName)
      .map((e) => eventNameToRoundCase(e.Name))
      .filter(Boolean),
  );

  return rounds.size > 1;
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function EventDisplay({ event }: { event: EventWithDate }) {
  const eventStatusLabel: Record<EventList["Status"], string> = {
    Unallocated: "Eräjaot puuttuvat",
    Allocated: "Eräjaot tehty",
    Progress: "Käynnissä",
    Official: "Tulokset valmiit",
  };
  const time = formatTime(event.BeginDateTimeWithTZ);
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex flex-col gap-2">
        <span>
          {event.EventName} {event.Name}
        </span>
        <Badge
          variant={
            event.Status === "Unallocated"
              ? "unallocated"
              : event.Status === "Allocated"
                ? "allocated"
                : event.Status === "Progress"
                  ? "progress"
                  : event.Status === "Official"
                    ? "official"
                    : "default"
          }
        >
          {eventStatusLabel[event.Status]}
        </Badge>
      </div>

      <div className="flex min-w-[90px] flex-col items-end gap-2 text-muted-foreground text-xs">
        <span className="flex items-center gap-1">
          {time}
          <Clock className="h-3 w-3" />
        </span>
        <span className="flex items-center gap-1">
          {event.date}
          <Calendar className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

export function EventSwitcher({
  competitionId,
  events,
  currentEventId,
}: {
  competitionId: string;
  events: Events;
  currentEventId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flattenedEvents: EventWithDate[] = Object.entries(events).flatMap(
    ([date, eventList]) =>
      eventList.map((event) => ({
        ...event,
        date,
      })),
  );
  const currentEvent = flattenedEvents.find(
    (e) => e.EventId === Number(currentEventId),
  );

  return (
    <Select
      itemToStringValue={(event) => `${event.EventId}-${event.Name}`}
      onValueChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        const roundCase = eventNameToRoundCase(event!.Name);
        const hasMultipleRounds = hasMultipleRoundsForEvent(
          flattenedEvents,
          event!.EventName,
        );

        if (hasMultipleRounds && roundCase) {
          params.set("round", roundCase);
        } else {
          params.delete("round");
        }
        router.push(
          `/competition/${competitionId}-${event!.EventId}?${params.toString()}`,
        );
      }}
      value={currentEvent}
    >
      <SelectTrigger className="!h-auto !items-center !py-2 !px-4 w-full sm:w-[400px]">
        <SelectValue className="w-full">
          {(event: EventWithDate) => <EventDisplay event={event} />}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {flattenedEvents.map((event) => (
          <SelectItem
            key={`${event.BeginDateTimeWithTZ}-${event.EventId}-${event.Name}`}
            value={event}
          >
            <EventDisplay event={event} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
