"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "~/@/components/ui/command";
import { tryCatch } from "~/shared/try-catch";
import type { CompetitionList, Events } from "~/types/comp";
import { Calendar, Clock } from "lucide-react";
import { set } from "zod";

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

async function getCompData() {
  const { data, error } = await tryCatch(
    fetch("https://cached-public-api.tuloslista.com/live/v1/competition"),
  );

  if (error || !data) {
    console.error("Error fetching comp data:", error);
    return [];
  }
  return (await data.json()) as CompetitionList[];
}

interface SearchFormProps {
  initialCompName?: string;
}

export function SearchForm({ initialCompName }: SearchFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [competitions, setCompetitions] = useState<CompetitionList[]>([]);
  const [selectedComp, setSelectedComp] = useState<CompetitionList | null>(
    null,
  );
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  async function searchForComp(compName: string | null, initial: boolean) {
    if (!compName) return;

    const compData = await getCompData();

    const match = compData.find((c) =>
      c.Name.toLowerCase().includes(compName.toLowerCase()),
    );
    if (match) {
      setSelectedComp(match);
      if (!initial) {
        setTimeout(() => {
          searchRef.current?.focus();
        }, 100);
      }
    }
  }

  useEffect(() => {
    const compFromUrl = searchParams.get("comp");

    if (compFromUrl && compFromUrl !== selectedComp?.Name) {
      setQuery(`${compFromUrl} / `);

      void searchForComp(compFromUrl, false);
    } else if (!compFromUrl && selectedComp && isInitialized) {
      // reset state
      console.log("Resetting state");
      setSelectedComp(null);
      setQuery("");
      setEvents([]);
    }
    setIsInitialized(true);
  }, [searchParams.get("comp")]);

  useEffect(() => {
    if (initialCompName && !selectedComp && isInitialized) {
      setQuery(`${initialCompName} / `);

      void searchForComp(initialCompName, true);
    }
  }, [initialCompName, selectedComp, isInitialized]);

  function updateURL(compName: string | null) {
    const url = new URL(window.location.href);
    if (compName) {
      url.searchParams.set("comp", compName);
    } else {
      url.searchParams.delete("comp");
    }
    window.history.replaceState({}, "", url.toString());
  }

  async function searchSomething(
    eventQuery: string | null,
    compName: string | null,
  ) {
    if (eventQuery !== null && selectedComp) {
      setIsLoadingEvents(true);
      setEvents([]);

      const { error, data } = await tryCatch(
        fetch(
          `https://cached-public-api.tuloslista.com/live/v1/competition/${selectedComp.Id}`,
        ),
      );

      if (error || !data) {
        console.error("Error fetching comp data:", error);
        setIsLoadingEvents(false);
        return [];
      }

      const parsed = (await data.json()) as Events;
      const allEvents = extractEvents(parsed);
      const filtered = allEvents.filter((e) =>
        e.EventName.toLowerCase().includes(eventQuery.toLowerCase()),
      );
      setEvents(filtered);
      setIsLoadingEvents(false);
    } else if (eventQuery === null && compName && !selectedComp) {
      const data = await getCompData();
      const match = data.filter((c) =>
        c.Name.toLowerCase().includes(compName.toLowerCase()),
      );
      setCompetitions(match);

      // Auto select if only one match and query doesn't contain "/"
      if (match.length === 1 && !query.includes("/")) {
        const selectedCompetition = match[0];
        setSelectedComp(selectedCompetition!);
        setQuery(`${selectedCompetition!.Name} / `);
        updateURL(selectedCompetition!.Name);
      }
    } else if (!compName && !eventQuery) {
      // Clear search results
      setCompetitions([]);
      setEvents([]);
    }
  }
  useEffect(() => {
    if (!isInitialized) return;

    const { compName, eventQuery } = parseScopedQuery(query);

    const timeout = setTimeout(
      () => void searchSomething(eventQuery, compName),
      300,
    );

    return () => clearTimeout(timeout);
  }, [query, selectedComp, isInitialized]);

  function handleInputChange(val: string) {
    // TODO: rethink this stupidness
    // const { eventQuery } = parseScopedQuery(val);

    // Only reset scope if we're removing the "/" entirely
    if (selectedComp && !val.includes("/")) {
      setSelectedComp(null);
      setEvents([]);
      setCompetitions([]);
      setQuery("");
      updateURL(null);
      return;
    }

    setQuery(val);
  }

  function handleCompetitionSelect(comp: CompetitionList) {
    setSelectedComp(comp);
    setQuery(`${comp.Name} / `);
    updateURL(comp.Name);
  }

  function handleEventSelect(event: EventData) {
    if (selectedComp) {
      // Redirect to competition page with compId-eventId format
      router.push(`/competition/${selectedComp.Id}-${event.Id}`);
    }
  }

  // FIXED: Better logic for determining what to show
  const showCompetitions = !selectedComp && competitions.length > 0;
  const showEvents = selectedComp && events.length > 0;
  const showLoading = selectedComp && isLoadingEvents;
  const showEmpty =
    !showCompetitions && !showEvents && !showLoading && query.length > 0;

  return (
    <div className="border-t shadow-md">
      <Command shouldFilter={false}>
        <CommandInput
          ref={searchRef}
          placeholder={
            selectedComp
              ? `Haetaan lajeja tulokseen ${selectedComp.Name}`
              : "Haetaan kilpailuja..."
          }
          value={query}
          onValueChange={handleInputChange}
          autoFocus={selectedComp ? true : false}
        />

        <CommandList>
          {showCompetitions && (
            <CommandGroup heading="Kilpailut">
              {competitions.map((comp) => (
                <CommandItem
                  key={comp.Id}
                  onSelect={() => handleCompetitionSelect(comp)}
                >
                  {comp.Name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {showLoading && (
            <CommandGroup heading="Lajit">
              <p className="text-muted-foreground px-3 py-2 text-sm">
                ladataan lajeja...
              </p>
            </CommandGroup>
          )}
          {showEvents && (
            <CommandGroup heading="Lajit">
              {events.map((evt) => (
                <CommandItem
                  key={`${evt.Id}-${evt.Date}-${evt.Time}`}
                  onSelect={() => handleEventSelect(evt)}
                  className="hover:bg-accent cursor-pointer"
                >
                  <div className="flex w-full justify-between">
                    <span className="font-medium">{evt.EventName}</span>
                    <ul className="text-muted-foreground flex items-center gap-3">
                      <li className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{evt.Time}</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">{evt.Date}</span>
                      </li>
                    </ul>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandEmpty>
            {selectedComp ? "Ei lajeja löytynyt" : "Ei kilpailuja löytynyt"}
          </CommandEmpty>
        </CommandList>
      </Command>
    </div>
  );
}
