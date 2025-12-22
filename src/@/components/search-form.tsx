"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, ChevronRight, Loader2, Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/@/components/ui/command";
import { tryCatch } from "~/shared/try-catch";
import type { CompetitionList, Events } from "~/types/comp";

type EventData = {
  Id: number;
  EventName: string;
  Date: string;
  Time: string;
};

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

export function SearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [competitions, setCompetitions] = useState<CompetitionList[]>([]);
  const [selectedComp, setSelectedComp] = useState<CompetitionList | null>(
    null,
  );
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoadingComps, setIsLoadingComps] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function searchCompetitions(query: string) {
    if (!query.trim()) {
      setCompetitions([]);
      return;
    }
    setIsLoadingComps(true);
    const data = await getCompData();
    const filtered = data.filter((comp) =>
      comp.Name.toLowerCase().includes(query.toLowerCase()),
    );
    setCompetitions(filtered);
    setIsLoadingComps(false);
  }

  async function searchEvents(comp: CompetitionList, query: string) {
    setIsLoadingEvents(true);
    const { error, data } = await tryCatch(
      fetch(
        `https://cached-public-api.tuloslista.com/live/v1/competition/${comp.Id}`,
      ),
    );
    if (error || !data) {
      setEvents([]);
      return;
    } else {
      const parsed = (await data.json()) as Events;
      const allEvents = extractEvents(parsed);
      const filtered = query
        ? allEvents.filter((event) =>
            event.EventName.toLowerCase().includes(query.toLowerCase()),
          )
        : allEvents;
      setEvents(filtered);
    }
    setIsLoadingEvents(false);
  }

  // old code that used url for comp and event state
  //  const params = new URLSearchParams(searchParams);
  //     if (term) {
  //       params.set("query", term);
  //     } else {
  //       params.delete("query");
  //     }
  function handleInputChange(value: string) {
    setQuery(value);
    setIsOpen(true);

    // Only reset scope if we're removing the "/" entirely
    if (selectedComp && !value.includes("/")) {
      setSelectedComp(null);
      setEvents([]);
      setQuery("");
      return;
    }
    if (selectedComp) {
      const parts = value.split("/");
      const eventQuery = parts[parts.length - 1]?.trim() || "";
      void searchEvents(selectedComp, eventQuery);
    } else {
      void searchCompetitions(value);
    }

    setQuery(value);
  }

  function handleCompetitionSelect(comp: CompetitionList) {
    setSelectedComp(comp);
    setQuery(`${comp.Name} / `);
    setCompetitions([]);
    void searchEvents(comp, "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  // Redirect to competition page with compId-eventId format
  function handleEventSelect(event: EventData) {
    if (selectedComp) {
      router.push(`/competition/${selectedComp.Id}-${event.Id}`);
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showCompetitions = !selectedComp && competitions.length > 0;
  const showEvents = selectedComp && events.length > 0;
  const showLoading = isLoadingComps || isLoadingEvents;
  const showEmpty =
    isOpen &&
    query.length > 0 &&
    !showCompetitions &&
    !showEvents &&
    !showLoading;
  const showDropdown =
    isOpen && (showCompetitions || showEvents || showLoading || showEmpty);

  return (
    <div ref={containerRef} className="relative w-full">
      <Command shouldFilter={false} className="overflow-visible bg-transparent">
        <div className="group focus-within:scale[1.01] relative transition-transform duration-200">
          <Search className="text-muted-foreground group-focus-within:text-primary absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transition-colors duration-200" />
          <input
            ref={inputRef}
            type="text"
            placeholder={
              selectedComp
                ? `Hae lajeja kilpailusta ${selectedComp.Name}...`
                : "Hae kilpailuja nimellä..."
            }
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="border-border bg-card placeholder:text-muted-foreground focus:border-primary focus:shadow-primary/5 h-14 w-full rounded-xl border-2 pr-12 pl-12 text-base shadow-lg transition-all duration-200 outline-none focus:shadow-xl"
          />
          {showLoading && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {showDropdown && (
          <div className="border-border bg-card animate-in fade-in-0 slide-in-from-top-2 absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border-2 shadow-xl duration-200">
            <CommandList className="max-h-80">
              {showCompetitions && (
                <CommandGroup
                  heading="Kilpailut"
                  className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:uppercase"
                >
                  {competitions.slice(0, 10).map((comp, index) => (
                    <CommandItem
                      key={comp.Id}
                      value={comp.Name}
                      onMouseDown={(event) => event.preventDefault()}
                      onSelect={() => handleCompetitionSelect(comp)}
                      className="data-[selected=true]:bg-accent animate-in fade-in-0 slide-in-from-left-2 mx-2 cursor-pointer gap-3 rounded-lg px-4 py-3 transition-all duration-150"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex flex-1 items-center justify-between">
                        <span className="font-medium">{comp.Name}</span>
                        <ChevronRight className="text-muted-foreground h-4 w-4 transition-transform duration-150 group-data-[selected=true]:translate-x-0.5" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {isLoadingEvents && (
                <div className="animate-in fade-in-0 px-4 py-6 text-center duration-200">
                  <Loader2 className="text-muted-foreground mx-auto h-6 w-6 animate-spin" />
                  <p className="text-muted-foreground mt-2 text-sm">
                    Ladataan lajeja...
                  </p>
                </div>
              )}
              {showEvents && (
                <CommandGroup
                  heading="Lajit"
                  className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:uppercase"
                >
                  {events.slice(0, 15).map((evt, index) => (
                    <CommandItem
                      key={`${evt.Id}-${evt.Date}-${evt.Time}`}
                      value={evt.EventName}
                      onMouseDown={(event) => event.preventDefault()}
                      onSelect={() => handleEventSelect(evt)}
                      className="data-[selected=true]:bg-accent animate-in fade-in-0 slide-in-from-left-2 mx-2 cursor-pointer rounded-lg px-4 py-3 transition-all duration-150"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="font-medium">{evt.EventName}</span>
                        <ul className="text-muted-foreground flex items-center gap-3">
                          <li className="flex items-center gap-1.5 text-sm">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{evt.Time}</span>
                          </li>
                          <li className="flex items-center gap-1.5 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span className="text-sm">{evt.Date}</span>
                          </li>
                        </ul>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {showEmpty && (
                <CommandEmpty className="text-muted-foreground animate-in fade-in-0 py-6 text-center text-sm duration-200">
                  {selectedComp
                    ? "Ei lajeja löytynyt"
                    : "Ei kilpailuja löytynyt"}
                </CommandEmpty>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
