"use client";

import type React from "react";

import { Card, CardContent } from "~/@/components/ui/card";
import {
  Clock,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Home,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "~/@/components/ui/button";
import { cn } from "~/@/lib/utils";
import {
  type EventList,
  type CompetitionProperties,
  type Events,
  Competition,
} from "~/types/comp";
import { Skeleton } from "~/@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/@/components/ui/tabs";
import { SectionHeader } from "~/app/events/[id]/[eventId]/_components/section-header";
import { EventCard } from "~/app/events/[id]/[eventId]/_components/event-card";
import { formatDate, formatTime, getStatusLabel } from "~/@/utils/event-utils";
import { StatusIndicator } from "~/@/components/ui/status-indicator";
import { EventDataTable } from "~/app/events/[id]/[eventId]/_components/event-data-table";
import { api } from "~/trpc/react";
import { Timetable } from "~/app/events/[id]/_components/timetable";
import { useQueries } from "@tanstack/react-query";

function getDates(datesArray: Events): string[] | undefined {
  const availableDates = Object.keys(datesArray);
  if (availableDates.length === 0) return; // Handle case where no data exists

  return availableDates;
}

function useAthleteCountData(
  selectedDate: string | undefined,
  dates: string[] | undefined,
  data: Events,
  competitionId: string,
) {
  // Extract all event IDs first
  const eventIds: string[] = [];

  for (const date of dates!) {
    if (date) {
      const events = data[selectedDate] ?? [];
      for (const event of events) {
        if (event.EventId) {
          eventIds.push(`${event.EventId}`);
        }
      }
    }
  }

  // Use the new procedure to fetch all counts at once
  const countsQuery = api.competition.getAthleteCounts.useQuery(
    {
      competitionId,
      eventIds,
    },
    {
      enabled: eventIds.length > 0 && !!competitionId,
      refetchOnMount: true,
      staleTime: 0, // Don't use stale data
    },
  );

  // Process the data once received
  const athleteCountData = useMemo(() => {
    console.log("Processing data in useMemo:", countsQuery.data);

    if (!countsQuery.data) {
      console.log("No data available yet");
      return [];
    }

    const countMap = new Map(
      countsQuery.data.map((item) => {
        console.log(`Mapping event ID ${item.eventId} to count ${item.count}`);
        return [item.eventId, item.count];
      }),
    );

    const result = [];

    for (const date of dates!) {
      if (date) {
        const events = data[selectedDate] ?? [];
        for (const event of events) {
          if (event.EventId) {
            result.push({
              date,
              event: event.EventName,
              athleteCount: countMap.get(`${event.EventId}`) ?? 0,
            });
          }
        }
      }
    }

    return result;
  }, [countsQuery.data, dates, data]);

  return {
    athleteCountData,
    isLoading: countsQuery.isLoading,
    isError: countsQuery.isError,
  };
}

export function EventsPage({
  data,
  details,
  competitionId,
}: {
  data: Events;
  details: CompetitionProperties;
  competitionId: string;
}) {
  const [loading, setLoading] = useState(true);

  const sortedEventsData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(data).map(([date, events]) => [
        date,
        [...events].sort(
          (a, b) =>
            new Date(a.BeginDateTimeWithTZ).getTime() -
            new Date(b.BeginDateTimeWithTZ).getTime(),
        ),
      ]),
    );
  }, [data]);

  const [events, setEvents] = useState<EventList[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventList | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [compId, setCompId] = useState<string>("");

  const dates = getDates(data);

  useEffect(() => {
    if (!selectedDate && dates && dates.length > 0) {
      // Only set the default date if it hasn't been set yet
      setSelectedDate(dates[0]!);
    }
  }, [dates, selectedDate]);

  // Then, handle updates when selectedDate changes
  useEffect(() => {
    if (!selectedDate) return; // Skip if no date selected

    // Update events based on selected date
    setEvents(sortedEventsData[selectedDate] ?? []);

    // Get the first event for this date if no event is selected yet
    // if (!selectedEvent) {
    //   const eventsForDate = sortedEventsData[selectedDate] ?? [];
    //   const firstEvent = eventsForDate[0] ?? null;
    //   setSelectedEvent(firstEvent);
    // }

    // Update compId whenever selectedDate or selectedEvent changes
    if (selectedEvent) {
      setCompId(`${competitionId}/${selectedEvent.EventId}`);
    }

    setLoading(false);
  }, [selectedDate, selectedEvent, sortedEventsData, details, competitionId]);

  const eventCompData = api.competition.getAthletes.useQuery(
    { compId },
    { enabled: !!compId },
  );

  // console.log(dates);
  // function getAthleteCount() {
  //   const countData = [];

  //   for (const date of dates) {
  //     if (!!date) {
  //       const events = data[date] ?? [];
  //       if (events.length === 0) {
  //         // No events for this date
  //         console.assert(false, "No events for this events");
  //         return;
  //       }
  //       for (const event of events) {
  //         const count = api.competition.getAthleteCount.useQuery(
  //           { compId: `${competitionId}/${event.EventId}` },
  //           { enabled: !!event.EventId },
  //         );

  //         countData.push({
  //           date: date,
  //           event: event.EventName,
  //           athleteCount: count.data,
  //         }); // Store date and count
  //       }
  //     }
  //   }
  //   return countData;
  // }

  const athleteCount = api.competition.getAthleteCount.useQuery(
    { compId },
    { enabled: !!compId },
  );
  const athleteCounts = useAthleteCountData(
    selectedDate,
    dates,
    data,
    competitionId,
  );
  if (athleteCounts.isLoading) {
    console.log("loading");
  } else if (athleteCounts.isError) {
    console.log("error");
  } else {
    console.table(athleteCounts.athleteCountData);
  }
  return (
    <div className="container mx-auto py-6">
      {loading ? (
        // Loading skeleton UI
        <>
          <Skeleton className="mb-6 h-40 w-full rounded-lg" />
          <div className="mb-4 flex items-center">
            <Skeleton className="mr-1 h-4 w-4" />
            <Skeleton className="mr-1 h-4 w-20" />
            <Skeleton className="mx-1 h-4 w-4" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="mb-6">
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-[500px] w-full rounded-lg" />
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
        </>
      ) : (
        // Actual content
        <>
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left side - Timetable */}
            {/* <div className="w-full lg:col-span-6">
              <Card className="h-fit w-full overflow-hidden border-0 shadow-md">
                <CardContent className="p-0">
                  <Tabs
                    // @ts-expect-error TODO: Fix this
                    defaultValue={dates[0]}
                    // @ts-expect-error TODO: Fix this
                    value={selectedDate}
                    onValueChange={setSelectedDate}
                    className="w-full"
                  >
                    {dates?.map((date) => (
                      <TabsContent
                        key={date}
                        value={date}
                        className="mt-0 overflow-x-auto"
                      >
                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 dark:from-blue-900/50 dark:to-blue-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="mr-2 rounded-full bg-blue-200/50 p-1.5 dark:bg-blue-700/30">
                                <Calendar className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                              </div>
                              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                                {date}
                              </h2>
                            </div>
                            <TabsList className="h-9 bg-blue-200/70 dark:bg-blue-800/50">
                              {dates?.map((tabDate) => (
                                <TabsTrigger
                                  key={tabDate}
                                  value={tabDate}
                                  className="text-blue-800 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:text-blue-200 dark:data-[state=active]:bg-blue-700"
                                >
                                  {tabDate}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </div>
                        </div>
                        <EventDataTable
                          className="max-h-96 overflow-y-scroll"
                          data={events}
                          columns={[
                            {
                              key: "time",
                              header: "Aika",
                              cell: (event) => (
                                <div className="flex items-center">
                                  <div className="mr-2 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span>
                                    {formatTime(event!.BeginDateTimeWithTZ)}
                                  </span>
                                </div>
                              ),
                            },
                            {
                              key: "event",
                              header: "Laji",
                              cell: (event) => (
                                <span className="font-medium">
                                  {event?.EventName}
                                </span>
                              ),
                            },
                            {
                              key: "round",
                              header: "Kierros",
                              cell: (event) => (
                                <span className="text-gray-600 dark:text-gray-400">
                                  {event?.Name}
                                </span>
                              ),
                            },
                            {
                              key: "status",
                              header: "Tila",
                              cell: (event) => (
                                <StatusIndicator
                                  // @ts-expect-error TODO: Fix this
                                  status={event?.Status}
                                />
                              ),
                            },
                          ]}
                          keyExtractor={(event) => event!.Id}
                          onRowClick={(event) => setSelectedEvent(event)}
                          selectedItem={selectedEvent}
                          isSelectable={true}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div> */}
            <Tabs
              defaultValue={dates[0]}
              value={selectedDate}
              onValueChange={setSelectedDate}
              className="w-full lg:col-span-6"
            >
              {dates?.map((date) => (
                <TabsContent key={date} value={date} className="w-full">
                  {dates.length > 1 && (
                    <div className="flex items-center py-2">
                      <TabsList className="">
                        {dates.map((tabDate) => (
                          <TabsTrigger
                            key={tabDate}
                            value={tabDate}
                            className=""
                          >
                            {tabDate}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  )}

                  <Timetable
                    data={events}
                    athleteCounts={athleteCounts}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                  />
                </TabsContent>
              ))}
            </Tabs>

            {/* Right side - Event details */}
            {selectedEvent ? (
              <div className="w-full lg:col-span-6">
                <Card className="w-full overflow-hidden border-0 shadow-md">
                  <CardContent className="p-0">
                    {selectedEvent && (
                      <>
                        <EventCard
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                          title={selectedEvent.EventName}
                          time={formatTime(selectedEvent.BeginDateTimeWithTZ)}
                          // @ts-expect-error TODO: Fix this StatusType return
                          status={getStatusLabel(
                            selectedEvent.BeginDateTimeWithTZ,
                          ).toLowerCase()}
                          footer={
                            <Link
                              href={`/events/${competitionId}/${selectedEvent.EventId}`}
                            >
                              <Button className="w-full bg-blue-600 shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Full Event Details
                              </Button>
                            </Link>
                          }
                        >
                          <SectionHeader
                            title="Results"
                            icon={<Calendar />}
                            size="sm"
                            className="mb-3"
                          />

                          {eventCompData.isLoading ? (
                            <Skeleton className="h-96 w-full rounded-lg" />
                          ) : (
                            <>
                              {eventCompData.data?.Rounds &&
                              eventCompData.data?.Rounds.length > 0 &&
                              !!eventCompData.data.Rounds[
                                eventCompData.data.Rounds.length - 1
                              ]?.TotalResults[0]?.Result ? (
                                <div className="overflow-x-auto rounded-lg border dark:border-gray-800">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                                          Pos
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                                          Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                                          Club
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
                                          Result
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {eventCompData.data?.Rounds[
                                        eventCompData.data?.Rounds.length - 1
                                      ]!.TotalResults.filter(
                                        (result) =>
                                          result.ResultRank &&
                                          result.ResultRank <= 5,
                                      )
                                        .sort(
                                          (a, b) =>
                                            (a.ResultRank ?? 999) -
                                            (b.ResultRank ?? 999),
                                        )
                                        .map((result) => (
                                          <tr
                                            key={result.AllocId}
                                            className="border-t transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900/30"
                                          >
                                            <td className="px-4 py-3">
                                              <div
                                                className={cn(
                                                  "flex h-8 w-8 items-center justify-center rounded-full font-medium text-white shadow-sm transition-transform hover:scale-105",
                                                  result.ResultRank === 1
                                                    ? "bg-yellow-500 dark:bg-yellow-600"
                                                    : result.ResultRank === 2
                                                      ? "bg-gray-400 dark:bg-gray-500"
                                                      : result.ResultRank === 3
                                                        ? "bg-amber-700 dark:bg-amber-800"
                                                        : "bg-blue-500 dark:bg-blue-600",
                                                )}
                                              >
                                                {result.ResultRank}
                                              </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                              {result.Name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                              {result.Organization.Name}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                              {result.Result.replace(",", ".")}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="rounded-lg border bg-gray-50 py-8 text-center dark:border-gray-800 dark:bg-gray-900/30">
                                  <div className="mb-3 text-gray-400">
                                    <Calendar className="mx-auto h-10 w-10 opacity-30" />
                                  </div>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    No results available for this event yet.{" "}
                                    {athleteCount.data}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </EventCard>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed p-8 text-center lg:col-span-6">
                <div>
                  <h3 className="mb-1 text-lg font-medium">Valitse laji</h3>
                  <p className="text-muted-foreground text-sm">
                    Valitse laji vasemmalta nähdäksesi sen tulokset
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
