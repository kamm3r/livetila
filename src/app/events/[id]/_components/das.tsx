"use client";

import type React from "react";

import { Card, CardContent } from "~/@/components/ui/card";
import { Badge } from "~/@/components/ui/badge";
import {
  Clock,
  Calendar,
  Medal,
  ExternalLink,
  Star,
  ArrowLeft,
  Home,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "~/@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/@/components/ui/tooltip";
import { cn } from "~/@/lib/utils";
import {
  type CompetitionProperties,
  type EventList,
  type Events,
} from "~/types/comp";
import { Skeleton } from "~/@/components/ui/skeleton";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/@/components/ui/tabs";

function getDates(datesArray: Events): string[] | undefined {
  const availableDates = Object.keys(datesArray);
  if (availableDates.length === 0) return; // Handle case where no data exists

  return availableDates;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventList | null>(null);
  const [competitionData, setCompetitionData] = useState<EventList | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const dates = getDates(data);

  useEffect(() => {
    const defaultDate = selectedDate || dates[0];
    setSelectedDate(defaultDate);
    const timer = setTimeout(() => {
      setEvents(data[defaultDate]);
      setSelectedEvent(
        data[defaultDate].find((e) => e.isFavorite) || data[defaultDate][0],
      );
      setCompetitionData(details);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [data, selectedDate]);

  // Toggle favorite status for an event
  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click

    // Update the events array with the toggled favorite status
    const updatedEvents = events.map((event) =>
      event.Id === id ? { ...event, isFavorite: !event.isFavorite } : event,
    );

    setEvents(updatedEvents);

    // Find the updated selected event if it was the one toggled
    if (selectedEvent?.Id === id) {
      const updatedEvent = updatedEvents.find((event) => event.Id === id);
      if (updatedEvent) {
        setSelectedEvent(updatedEvent);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d.M.yyyy", { locale: fi });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: fi });
  };

  return (
    <div className="container mx-auto px-4 py-6">
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
          {/* Header */}
          <div className="mb-6 overflow-hidden rounded-lg bg-gradient-to-r from-blue-700 to-indigo-800 shadow-lg dark:from-blue-800 dark:to-indigo-900">
            <div className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3 rounded-full bg-white/10 p-2 dark:bg-white/5">
                    <Trophy className="h-6 w-6 text-blue-100" />
                  </div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">
                    {competitionData?.Competition.Name}
                  </h1>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-blue-100">
                <div className="flex items-center rounded-full bg-white/10 px-3 py-1 dark:bg-white/5">
                  <Calendar className="mr-1.5 h-4 w-4" />
                  <span>
                    {formatDate(competitionData?.Competition.BeginDate || "")}
                  </span>
                </div>
                <div className="flex items-center rounded-full bg-white/10 px-3 py-1 dark:bg-white/5">
                  <span>{competitionData?.Competition.Organization}</span>
                </div>
                <p className="ml-1">
                  Valitse laji, jonka tuloksia haluat tarkastella tarkemmin.
                </p>
              </div>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="text-muted-foreground mb-4 flex items-center text-sm">
            <Link
              href="/"
              className="flex items-center transition-colors hover:text-blue-600"
            >
              <Home className="mr-1 h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="mx-1 h-3.5 w-3.5" />
            <span className="text-foreground font-medium">
              {competitionData?.Competition.Name}
            </span>
          </div>

          {/* Back button */}
          <div className="mb-6">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-muted/80 flex items-center transition-colors"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Schedule
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left side - Timetable */}
            <Card className="h-fit overflow-hidden border-0 shadow-md">
              <CardContent className="p-0">
                <Tabs defaultValue={dates[0]}>
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 dark:from-blue-900/50 dark:to-blue-800/50">
                    <div className="flex items-center">
                      <div className="mr-2 rounded-full bg-blue-200/50 p-1.5 dark:bg-blue-700/30">
                        <Calendar className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                      </div>
                      {dates?.map((date) => (
                        <TabsList
                          key={date}
                          className="grid w-full grid-cols-2"
                        >
                          <TabsTrigger
                            value={date}
                            onClick={() => setSelectedDate(date)}
                          >
                            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                              {date}
                            </h2>
                          </TabsTrigger>
                        </TabsList>
                      ))}
                    </div>
                  </div>
                  {dates?.map((date) => (
                    <TabsContent
                      key={date}
                      value={date}
                      className="overflow-x-auto"
                    >
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                              Aika
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                              Laji
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                              Kierros
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                              Tila
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((event, index) => (
                            <tr
                              key={event.Id}
                              className={cn(
                                "cursor-pointer border-b transition-colors dark:border-gray-800",
                                selectedEvent?.Id === event.Id
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : index % 2 === 0
                                    ? "bg-white dark:bg-transparent"
                                    : "bg-gray-50/50 dark:bg-gray-900/10",
                              )}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="mr-2 rounded-full bg-blue-100 p-1 dark:bg-blue-900/30">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span>
                                    {formatTime(event.BeginDateTimeWithTZ)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {event.EventName}
                              </td>
                              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                {event.Name}
                              </td>
                              <td className="px-4 py-3">
                                <Badge
                                  className={cn(
                                    "transition-colors",
                                    event.Status === "Official"
                                      ? "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800"
                                      : event.Status === "Unofficial"
                                        ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-700 dark:hover:bg-amber-800"
                                        : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800",
                                  )}
                                >
                                  {event.Status === "Official"
                                    ? "Completed"
                                    : event.Status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {/* Right side - Event details */}
            <Card className="overflow-hidden border-0 shadow-md">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white dark:from-blue-800 dark:to-blue-900">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold">
                      {selectedEvent?.EventName}
                    </h3>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-full bg-white/10 px-3 py-1 dark:bg-black/20">
                      <Clock className="mr-1.5 h-4 w-4" />
                      <span>
                        {formatTime(selectedEvent?.BeginDateTimeWithTZ || "")}
                      </span>
                    </div>
                    <div className="flex items-center rounded-full bg-white/10 px-3 py-1 dark:bg-black/20">
                      <span>{selectedEvent?.Name}</span>
                    </div>
                    <Badge
                      className={cn(
                        "ml-0 transition-colors",
                        selectedEvent?.Status === "Official"
                          ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                          : selectedEvent?.Status === "Unofficial"
                            ? "bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800"
                            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
                      )}
                    >
                      {selectedEvent?.Status === "Official"
                        ? "Completed"
                        : selectedEvent?.Status}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  {/* Results section */}
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                      <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold">Results</h4>
                  </div>

                  {selectedEvent?.Rounds && selectedEvent.Rounds.length > 0 ? (
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
                          {selectedEvent.Rounds[
                            selectedEvent.Rounds.length - 1
                          ].TotalResults.filter(
                            (result) =>
                              result.ResultRank && result.ResultRank <= 5,
                          )
                            .sort(
                              (a, b) =>
                                (a.ResultRank || 999) - (b.ResultRank || 999),
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
                        <Trophy className="mx-auto h-10 w-10 opacity-30" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">
                        No results available for this event yet.
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    <Link
                      href={`/events/${competitionId}/${selectedEvent?.EventId}`}
                    >
                      <Button className="w-full bg-blue-600 shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Event Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
