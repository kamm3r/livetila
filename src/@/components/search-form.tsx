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
  const match = /^(.+?)\s*\/\s*(.*)$/.exec(input);
  if (match) {
    return {
      compName: match[1]?.trim(),
      eventQuery: match[2]?.trim(),
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
    data[dateKey].forEach((event) => {
      const compDate = new Date(event.BeginDateTimeWithTZ);
      const year = compDate.getFullYear();
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

  useEffect(() => {
    const { compName, eventQuery } = parseScopedQuery(query);

    const timeout = setTimeout(async () => {
      if (eventQuery !== null && selectedComp) {
        // Search events in selected competition
        console.log(
          `Searching events for: "${eventQuery}" in ${selectedComp.Name}`,
        );
        setIsLoadingEvents(true);

        const res = await tryCatch(
          fetch(
            `https://cached-public-api.tuloslista.com/live/v1/competition/${selectedComp.Id}`,
          ),
        );

        if (res.data?.ok) {
          const parsed = await res.data.json();
          console.log("Raw API response:", parsed);
          const allEvents = extractEvents(parsed);
          console.log("All extracted events:", allEvents);
          const filtered = allEvents.filter((e) =>
            e.EventName.toLowerCase().includes(eventQuery.toLowerCase()),
          );
          console.log(
            `Found ${filtered.length} events matching "${eventQuery}":`,
            filtered,
          );
          setEvents(filtered);
        }
        setIsLoadingEvents(false);
      } else if (eventQuery === null && compName) {
        // Search competitions
        console.log(`Searching competitions for: "${compName}"`);
        const res = await tryCatch(
          fetch("https://cached-public-api.tuloslista.com/live/v1/competition"),
        );

        if (res.data?.ok) {
          const data: CompetitionList[] = await res.data.json();
          const match = data.filter((c) =>
            c.Name.toLowerCase().includes(compName.toLowerCase()),
          );
          setCompetitions(match);

          // Auto select if only one match and query doesn't contain "/"
          if (match.length === 1 && !query.includes("/")) {
            setSelectedComp(match[0]);
            setQuery(`${match[0].Name} / `);
          }
        }
      }
    }, 300);

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
      console.log("Redirecting with:", {
        compId: selectedComp.Id,
        eventId: event.Id,
      });
      // Redirect to competition page with compId-eventId format
      router.push(`/competition/${selectedComp.Id}-${event.Id}`);
    }
  };

  console.log("Render state:", {
    selectedComp: selectedComp?.Name,
    eventsCount: events.length,
    events,
    query,
  });

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

        {selectedComp && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Debug: {events.length} events loaded, loading:{" "}
            {isLoadingEvents.toString()}
          </div>
        )}

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

// "use client";
// import { z } from "zod";
// import { useRouter } from "next/navigation";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { CardContent } from "~/@/components/ui/card";
// import { Input } from "~/@/components/ui/input";
// import { Button } from "~/@/components/ui/button";
// import { useForm } from "react-hook-form";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "~/@/components/ui/form";
// import { tryCatch } from "~/shared/try-catch";
// import { useEffect, useState } from "react";
// import { CompetitionList, Events } from "~/types/comp";

// const inputSchema = z.object({
//   compId: z
//     .string()
//     .regex(new RegExp("[0-9]-[0-9]"), {
//       message: "Sen pitää näyttää tältä 1234-567890",
//     })
//     .min(10, {
//       message: "kilpailu id pitää olla minimissä 10 karakteria",
//     })
//     .max(15, {
//       message: "thing again putting amount of number here.",
//     }),
// });

// function debounce<T extends (...args: unknown[]) => void>(
//   func: T,
//   wait: number,
// ) {
//   let timeout: ReturnType<typeof setTimeout>;

//   return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
//     // eslint-disable-next-line @typescript-eslint/no-this-alias
//     const context = this;
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func.apply(context, args), wait);
//   };
// }

// export function SearchForm() {
//   const router = useRouter();
//   const form = useForm<z.infer<typeof inputSchema>>({
//     resolver: zodResolver(inputSchema),
//     mode: "onChange",
//   });
//   const [eventData, setEventData] = useState([]);
//   const [compData, setCompData] = useState([]);
//   const [compId, setCompId] = useState(null);
//   async function searchCompetition(name: string) {
//     const CompetitionData = await tryCatch(
//       fetch(`https://cached-public-api.tuloslista.com/live/v1/competition`),
//     );

//     if (CompetitionData.error || !CompetitionData.data) {
//       console.assert(`No competition found ${CompetitionData.error.message}`);
//     }
//     const response = CompetitionData.data;
//     if (!response?.ok) {
//       console.assert(`Error status ${CompetitionData.data?.status}`);
//     }
//     const parsedData = await tryCatch(
//       response?.json() as Promise<CompetitionList[]>,
//     );

//     const searched = parsedData.data?.filter((comp) =>
//       comp.Name.toLowerCase().includes(name.toLowerCase()),
//     );
//     setCompData(searched);

//     if (searched.length === 1) {
//       setCompId(searched[0]?.Id);
//       console.log(compId);
//     } else {
//       setCompId(null);
//     }
//   }
//   const debounceSearch = debounce(searchCompetition, 500);

//   function extractData(data: Events) {
//     const results = [];

//     for (const dateKey of Object.keys(data)) {
//       data[dateKey].forEach((event) => {
//         const compDate = new Date(event.BeginDateTimeWithTZ);
//         const year = compDate.getFullYear();
//         const month = String(compDate.getMonth() + 1).padStart(2, "0");
//         const day = String(compDate.getDate()).padStart(2, "0");
//         const hours = String(compDate.getHours()).padStart(2, "0");
//         const minutes = String(compDate.getMinutes()).padStart(2, "0");
//         results.push({
//           Id: event.Id,
//           EventName: event.EventName,
//           Date: `${day}.${month}.`,
//           Time: `${hours}:${minutes}`,
//         });
//       });
//     }
//     return results;
//   }
//   async function searchEvent(Id: number, name: string) {
//     const dataEvent = await tryCatch(
//       fetch(
//         `https://cached-public-api.tuloslista.com/live/v1/competition/${Id}`,
//       ),
//     );
//     if (dataEvent.error || !dataEvent.data) {
//       console.assert(`No event found ${dataEvent.error.message}`);
//     }
//     const response = dataEvent.data;
//     if (!response?.ok) {
//       console.assert(`Error status ${dataEvent.data?.status}`);
//     }
//     const parsedData = await tryCatch(response?.json() as Promise<Events>);
//     const extractedData = extractData(parsedData.data!);
//     console.table(extractedData);
//     const searched = extractedData.filter((event) =>
//       event.EventName.toLowerCase().includes(name.toLowerCase()),
//     );
//     setEventData(searched);
//   }

//   function handleBusta(event) {
//     debounceSearch(event.target.value);
//   }
//   function handleBustaEvent(event) {
//     searchEvent(compId, event.target.value);
//     console.log(`eventdata: ${eventData}`);
//   }

//   function busta(value: z.infer<typeof inputSchema>): void {
//     void router.push(`/competition/${value.compId}`);
//   }
//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(busta)}>
//         <CardContent className="flex flex-col gap-1">
//           <FormField
//             control={form.control}
//             name="compId"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Kilpailu id</FormLabel>
//                 <FormControl>
//                   <Input placeholder="type comp id" {...field} required />
//                 </FormControl>
//                 <FormDescription className="text-xs text-muted-foreground">
//                   Odotettu formaatti `1234-567890`
//                 </FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <Button
//             type="submit"
//             disabled={
//               form.formState.isValid || form.formState.isSubmitting
//                 ? false
//                 : true
//             }
//           >
//             Menee kilpailuun
//           </Button>
//           <div className="flex">
//             <Input onChange={handleBusta} />
//             <Input onChange={handleBustaEvent} />
//           </div>
//           {compData.length < 1 && (
//             <div className="flex flex-col gap-1">
//               {eventData.map((ftc) => (
//                 <div>{ftc.EventName}</div>
//               ))}
//             </div>
//           )}
//           {compData && (
//             <div className="flex flex-col gap-1">
//               {compData.map((ftc) => (
//                 <div className="flex gap-1">
//                   {eventData && (
//                     <>
//                       {ftc.Name}
//                       <div className="flex flex-col gap-1">
//                         {eventData.map((ftc) => (
//                           <div>
//                             {ftc.EventName} - {ftc.Date} {ftc.Time}
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </form>
//     </Form>
//   );
// }
