"use client";
import { Calendar, ChevronRight, Clock, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/@/components/ui/command";
import { api } from "~/trpc/react";
import type { CompetitionList, Events } from "~/types/comp";

type EventData = {
  Id: number;
  EventName: string;
  Name: string;
  Date: string;
  Time: string;
};

function extractEvents(data: Events): EventData[] {
  const results: EventData[] = [];
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
        Name: event.Name,
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
  const [selectedComp, setSelectedComp] = useState<CompetitionList | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: competitions, isLoading: isLoadingComps } =
    api.competition.getCompetitions.useQuery();
  const { data: events, isLoading: isLoadingEvents } =
    api.competition.getEvents.useQuery(
      { compId: selectedComp?.Id.toString() ?? "" },
      {
        enabled: !!selectedComp,
      },
    );

  const competitionResults =
    selectedComp || !query.trim()
      ? competitions?.sort((a, b) => b.Date.localeCompare(a.Date))
      : competitions?.filter((comp) =>
          comp.Name.toLowerCase().includes(query.toLowerCase()),
        );

  const eventQuery =
    selectedComp && query.includes("/")
      ? (query.split("/").pop()?.trim() ?? "")
      : "";

  const eventResults =
    selectedComp && events
      ? extractEvents(events)
          .filter(
            (evt) =>
              !eventQuery ||
              evt.EventName.toLowerCase().includes(eventQuery.toLowerCase()),
          )
          .sort((a, b) => a.Time.localeCompare(b.Time))
      : [];

  function handleInputChange(value: string) {
    setIsOpen(true);
    setQuery(value);
    if (selectedComp && !value.includes("/")) {
      setSelectedComp(null);
      setQuery("");
    }
  }

  function handleCompetitionSelect(comp: CompetitionList) {
    setSelectedComp(comp);
    setQuery(`${comp.Name} / `);
  }

  function handleEventSelect(event: EventData) {
    if (selectedComp) {
      router.push(`/competition/${selectedComp.Id}-${event.Id}`);
    }
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  }

  function handleFocus() {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsOpen(true);
  }

  const showCompetitions =
    !selectedComp && (competitionResults?.length ?? 0) > 0;
  const showEvents =
    selectedComp && eventResults.length > 0 && !isLoadingEvents;
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
    <div className="relative w-full">
      <Command className="overflow-visible bg-transparent" shouldFilter={false}>
        <CommandInput
          className=""
          onBlur={handleBlur}
          onChangeCapture={(event) =>
            handleInputChange(event.currentTarget.value)
          }
          onFocus={handleFocus}
          placeholder={
            selectedComp
              ? `Hae lajeja kilpailusta ${selectedComp.Name}...`
              : "Hae kilpailuja nimellä..."
          }
          value={query}
        />
        {showLoading && (
          <Loader2 className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        <AnimatePresence mode="wait">
          {showDropdown && (
            <motion.div
              initial={{ y: -32, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ type: "spring", duration: 0.4, bounce: 0 }}
              className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border-2 border-border bg-card shadow-xl"
            >
              <CommandList className="max-h-80">
                <AnimatePresence>
                  {showEmpty && (
                    <motion.div
                      initial={{ opacity: 0, x: -25 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 25 }}
                      transition={{
                        type: "spring",
                        duration: 0.4,
                        bounce: 0,
                      }}
                    >
                      <CommandEmpty className="py-6 text-center text-muted-foreground text-sm">
                        {selectedComp
                          ? "Ei lajeja löytynyt"
                          : "Ei kilpailuja löytynyt"}
                      </CommandEmpty>
                    </motion.div>
                  )}
                  {showCompetitions && (
                    <CommandGroup heading="Kilpailut">
                      {competitionResults?.slice(0, 10).map((comp, index) => (
                        <motion.div
                          key={comp.Id}
                          initial={{ opacity: 0, x: -25 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 25 }}
                          transition={{
                            type: "spring",
                            duration: 0.4,
                            bounce: 0,
                          }}
                        >
                          <CommandItem
                            className=""
                            key={comp.Id}
                            onMouseDown={(event) => event.preventDefault()}
                            onSelect={() => handleCompetitionSelect(comp)}
                            style={{ animationDelay: `${index * 20}ms` }}
                            value={`${comp.Name}-${comp.Date}-${comp.Id}`}
                          >
                            <div className="flex flex-1 items-center justify-between">
                              <span className="font-medium">{comp.Name}</span>
                              <div className="flex items-center gap-4 text-muted-foreground">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    {new Date(comp.Date).getDate()}.
                                    {new Date(comp.Date).getMonth() + 1}.
                                  </span>
                                </div>
                                <ChevronRight className="h-4 w-4 transition-transform duration-200 ease-out group-data-[selected=true]:translate-x-0.5" />
                              </div>
                            </div>
                          </CommandItem>
                        </motion.div>
                      ))}
                    </CommandGroup>
                  )}
                  {isLoadingEvents && (
                    <div className="fade-in-0 animate-in px-4 py-6 text-center duration-200">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground text-sm">
                        Ladataan lajeja...
                      </p>
                    </div>
                  )}
                  {showEvents && (
                    <CommandGroup heading="Lajit">
                      {eventResults.slice(0, 15).map((evt, index) => (
                        <CommandItem
                          className=""
                          key={`${evt.Id}-${evt.Date}-${evt.Time}`}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            handleEventSelect(evt);
                          }}
                          onSelect={() => handleEventSelect(evt)}
                          style={{ animationDelay: `${index * 20}ms` }}
                          value={`${evt.EventName}-${evt.Date}-${evt.Time}-${evt.Id}`}
                        >
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="font-medium">
                              {evt.EventName}{" "}
                              <span className="text-muted-foreground">
                                {evt.Name}
                              </span>
                            </span>
                            <div className="flex items-center gap-4 text-muted-foreground">
                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  <span>{evt.Time}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3" />
                                  <span>{evt.Date}</span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 transition-transform duration-150 group-data-[selected=true]:translate-x-0.5" />
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </AnimatePresence>
              </CommandList>
            </motion.div>
          )}
        </AnimatePresence>
      </Command>
    </div>
  );
}
