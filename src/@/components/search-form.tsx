"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from "~/@/components/ui/command";
import { tryCatch } from "~/shared/try-catch";
import type { CompetitionList, Events } from "~/types/comp";

function parseScopedQuery(input: string) {
  const parts = input.split("/");
  if (parts.length > 1) {
    const compName = parts.join("/").trim();
    const eventQuery = parts.pop()?.trim() ?? "";
    return {
      compName: compName,
      eventQuery: eventQuery,
    };
  }
  return {
    compName: input.trim(),
    eventQuery: null,
  };
}

type EventData = { Id: number; EventName: string; Date: string; Time: string };

function extractEvents(data: Events): EventData[] {
  const results = new Array<EventData>();
  for (const dateKey of Object.keys(data)) {
    data[dateKey as keyof Events].forEach((event) => {
      const compDate = new Date(event.BeginDateTimeWithTZ);
      // const year = compDate.getFullYear(); // this is in case it's needed
      const month = String(compDate.getMonth() + 1).padStart(2, "0");
      const day = String(compDate.getDate()).padStart(2, "0");
      const hours = String(compDate.getHours()).padStart(2, "0");
      const minutes = String(compDate.getMinutes()).padStart(2, "0");
      results.push({
        Id: event.EventId,
        EventName: event.EventName,
        Date: `${day}.${month}.`,
        Time: `${hours}:${minutes}`,
      });
    });
  }
  return results;
}

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [competitions, setCompetitions] = useState<CompetitionList[]>([]);
  const [selectedComp, setSelectedComp] = useState<CompetitionList | null>(
    null,
  );
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  async function searchSomething(
    eventQuery: string | null,
    compName: string | null,
  ) {
    if (eventQuery !== null && selectedComp) {
      // Search events in selected competition
      setIsLoadingEvents(true);

      const res = await tryCatch(
        fetch(
          `https://cached-public-api.tuloslista.com/live/v1/competition/${selectedComp.Id}`,
        ),
      );

      if (res.data?.ok) {
        const parsed = (await res.data.json()) as Events;
        const allEvents = extractEvents(parsed);
        const filtered = allEvents.filter((e) =>
          e.EventName.toLowerCase().includes(eventQuery.toLowerCase()),
        );

        setEvents(filtered);
      }
      setIsLoadingEvents(false);
    } else if (eventQuery === null && compName) {
      // Search competitions
      const res = await tryCatch(
        fetch("https://cached-public-api.tuloslista.com/live/v1/competition"),
      );

      if (res.data?.ok) {
        const data = (await res.data.json()) as CompetitionList[];
        const match = data.filter((c) =>
          c.Name.toLowerCase().includes(compName.toLowerCase()),
        );
        setCompetitions(match);

        // Auto select if only one match and query doesn't contain "/"
        if (match.length === 1 && !query.includes("/")) {
          setSelectedComp(match[0]!);
          setQuery(`${match[0]?.Name} / `);
        }
      }
    }
  }

  useEffect(() => {
    const { compName, eventQuery } = parseScopedQuery(query);

    const timeout = setTimeout(
      () => void searchSomething(eventQuery, compName),
      300,
    );

    return () => clearTimeout(timeout);
  }, [query, selectedComp]);

  const resetScope = () => {
    setSelectedComp(null);
    setEvents([]);
    setCompetitions([]);
    setQuery("");
  };

  const handleInputChange = (val: string) => {
    const { eventQuery } = parseScopedQuery(val);

    // Only reset scope if we're removing the "/" entirely
    if (selectedComp && !val.includes("/")) {
      resetScope();
      return;
    }

    setQuery(val);
  };

  const handleEventSelect = (event: EventData) => {
    if (selectedComp) {
      router.push(`/competition/${selectedComp.Id}-${event.Id}`);
    }
  };

  return (
    <div className="rounded-lg border shadow-md">
      {selectedComp && (
        <div className="border-b bg-muted px-3 pb-1 pt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {selectedComp.Name}
          </span>
          <span className="mx-1 text-muted-foreground">/</span>
          <button
            onClick={resetScope}
            className="ml-2 text-xs text-blue-500 underline hover:text-blue-600"
          >
            change
          </button>
        </div>
      )}

      <Command shouldFilter={false}>
        <CommandInput
          placeholder={
            selectedComp
              ? `Search events in ${selectedComp.Name}`
              : "Search competitions..."
          }
          value={query}
          onValueChange={handleInputChange}
        />

        <CommandList>
          {!selectedComp && competitions.length > 0 && (
            <CommandGroup heading="Competitions">
              {competitions.map((comp) => (
                <CommandItem
                  key={comp.Id}
                  onSelect={() => {
                    setSelectedComp(comp);
                    setQuery(`${comp.Name} / `);
                  }}
                >
                  {comp.Name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {selectedComp && (
            <CommandGroup heading="Events">
              {isLoadingEvents && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Loading events...
                </div>
              )}
              {!isLoadingEvents && events.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No events found
                </div>
              )}
              {events.map((evt) => (
                <CommandItem
                  key={evt.Id}
                  onSelect={() => handleEventSelect(evt)}
                  className="cursor-pointer hover:bg-accent"
                >
                  <div className="flex w-full justify-between">
                    <span>{evt.EventName}</span>
                    <span className="text-muted-foreground">
                      {evt.Date} {evt.Time}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!selectedComp && competitions.length === 0 && !isLoadingEvents && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No competitions found
            </div>
          )}
        </CommandList>
      </Command>
    </div>
  );
}
