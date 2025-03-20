"use client";

import { useEffect, useState } from "react";
import { CardContent } from "~/@/components/ui/card";
import { Card } from "~/@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/@/components/ui/tabs";
import { Button } from "~/@/components/ui/button";
import { Badge } from "~/@/components/ui/badge";
import {
  Medal,
  Award,
  CheckCircle,
  Trophy,
  ClipboardList,
  Users,
} from "lucide-react";
import { cn } from "~/@/lib/utils";
import { EventDataTable } from "./event-data-table";
import { EventCard } from "./event-card";
import { SectionHeader } from "./section-header";
import { type Competition } from "~/types/comp";
import { useEventRounds } from "~/@/hooks/use-event-rounds";
import { useRound } from "~/@/components/round-provider";

export default function EventDetailTabs({
  eventData,
}: {
  eventData: Competition;
}) {
  const {
    selectedRound,
    selectedHeat,
    currentRound,
    currentHeat,
    heats,
    showHeatNumbers,
    handleHeatChange,
  } = useRound();
  // const [isFavorite, setIsFavorite] = useState<boolean>(
  //   eventData.isFavorite || false,
  // );

  useEffect(() => {
    console.log("Parent component - selectedRound:", selectedRound);
  }, [selectedRound]);

  // // Toggle favorite status
  // const toggleFavorite = () => {
  //   setIsFavorite(!isFavorite);
  // };

  return (
    <div className="border-b">
      <div className="container">
        {/* Main Tabs */}
        <Tabs defaultValue="participants" className="mt-2 w-full">
          <TabsList className="grid h-auto w-full grid-cols-3 bg-transparent p-0">
            <TabsTrigger
              value="participants"
              className="data-[state=active]:bg-background data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground rounded-none border-b-2 border-transparent py-3 data-[state=active]:shadow-none"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border">
                  <Users className="h-3 w-3" />
                </span>
                <span>Ilmoittautuneet</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="protocol"
              className="data-[state=active]:bg-background data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground rounded-none border-b-2 border-transparent py-3 data-[state=active]:shadow-none"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border">
                  <ClipboardList className="h-3 w-3" />
                </span>
                <span>Pöytäkirjat</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-background data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground rounded-none border-b-2 border-transparent py-3 data-[state=active]:shadow-none"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border">
                  <Trophy className="h-3 w-3" />
                </span>
                <span>Tulokset</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Participants Tab */}
          <TabsContent
            value="participants"
            className="animate-in fade-in-50 duration-300"
          >
            {/* // this is bad TODO:Make it better not this stupid way */}
            <EventDataTable
              data={eventData.Enrollments}
              columns={[
                {
                  key: "confirmed",
                  header: "Varm.",
                  cell: (participant) =>
                    participant.Confirmed ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    ) : null,
                },
                {
                  key: "name",
                  header: "Nimi",
                  cell: (participant) => (
                    <div className="flex items-center">
                      <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                        {participant.Number}
                      </span>
                      <span className="font-medium">{participant.Name}</span>
                    </div>
                  ),
                },
                {
                  key: "club",
                  header: "Seura",
                  cell: (participant) => participant.Organization.Name,
                },
                {
                  key: "pb",
                  header: "PB",
                  cell: (participant) => (
                    <span className="font-medium">{participant.PB || "-"}</span>
                  ),
                },
                {
                  key: "sb",
                  header: "SB",
                  cell: (participant) => (
                    <span className="font-medium">{participant.SB || "-"}</span>
                  ),
                },
              ]}
              keyExtractor={(participant) => participant.Id}
              rowClassName={(participant) =>
                participant.Confirmed
                  ? "bg-green-50/70 dark:bg-green-900/10"
                  : ""
              }
            />
          </TabsContent>

          {/* Protocol Tab Content */}
          <TabsContent
            value="protocol"
            className="animate-in fade-in-50 duration-300"
          >
            {heats.length > 0 ? (
              <div className="space-y-6">
                {/* Heat Selection Tabs - Only show when there are multiple heats */}
                {showHeatNumbers && heats.length > 1 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    <div className="text-muted-foreground mb-2 w-full text-sm">
                      Select heat:
                    </div>
                    {heats.map((heat) => (
                      <Button
                        key={heat.Index}
                        variant={
                          selectedHeat === heat.Index ? "default" : "outline"
                        }
                        onClick={() => handleHeatChange(heat.Index)}
                        className={`transition-all ${
                          selectedHeat === heat.Index
                            ? "bg-blue-600 shadow-md hover:bg-blue-700"
                            : "hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        Heat {heat.Index}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Current Heat */}
                {/* <div className="flex items-center gap-3">
            {time && (
              <div className="text-muted-foreground flex items-center text-sm">
                <Clock className="mr-1.5 h-4 w-4" />
                {time}
              </div>
            )}
            {status && <StatusIndicator status={status} />}
            {headerActions}
          </div> */}
                <EventDataTable
                  data={currentHeat?.Allocations || []}
                  columns={[
                    {
                      key: "position",
                      header:
                        showHeatNumbers && heats.length > 1 ? "Rata" : "Järj",
                      cell: (allocation) => (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                          {allocation.Position}
                        </span>
                      ),
                    },
                    {
                      key: "name",
                      header: "Nimi",
                      cell: (allocation) => (
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                              {allocation.Number}
                            </span>
                            <span className="font-medium">
                              {allocation.Name}
                            </span>
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "club",
                      header: "Seura",
                      cell: (allocation) => allocation.Organization.Name,
                    },
                    {
                      key: "pb",
                      header: "PB",
                      cell: (allocation) => (
                        <span className="font-medium">
                          {allocation.PB || "-"}
                        </span>
                      ),
                    },
                    {
                      key: "sb",
                      header: "SB",
                      cell: (allocation) => (
                        <span className="font-medium">
                          {allocation.SB || "-"}
                        </span>
                      ),
                    },
                  ]}
                  keyExtractor={(allocation) => allocation.AllocId}
                  wrapWithCard={false}
                />
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No heat data available for this round.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent
            value="results"
            className="animate-in fade-in-50 duration-300"
          >
            {currentRound?.TotalResults &&
            currentRound.TotalResults.length > 0 ? (
              <div className="space-y-6">
                {/* Heat Selection and Wind - Only show when there are multiple heats */}
                {showHeatNumbers && heats.length > 1 && (
                  <div>
                    {/* Heat Selection and Wind */}
                    <div className="mb-4 flex flex-wrap items-center gap-4">
                      <div className="w-full md:w-auto">
                        <div className="text-muted-foreground mb-2 text-sm">
                          Select heat:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {heats.map((heat) => (
                            <Button
                              key={heat.Index}
                              variant={
                                selectedHeat === heat.Index
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => handleHeatChange(heat.Index)}
                              className={`transition-all ${
                                selectedHeat === heat.Index
                                  ? "bg-blue-600 shadow-md hover:bg-blue-700"
                                  : "hover:bg-blue-50 hover:text-blue-600"
                              }`}
                            >
                              Heat {heat.Index}
                            </Button>
                          ))}
                        </div>
                      </div>
                      {currentHeat?.Wind && currentHeat.Wind !== "NM" && (
                        <div className="flex items-center rounded-full bg-blue-50 px-4 py-2 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                          <span className="font-medium">
                            Tuuli: {currentHeat.Wind}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Current Heat Results */}
                    <Card className="overflow-hidden border-0 shadow-md">
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                                <th className="px-4 py-3 text-left font-medium text-blue-800 dark:text-blue-200">
                                  Sij.
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-blue-800 dark:text-blue-200">
                                  Nimi ja seura
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-blue-800 dark:text-blue-200">
                                  Tulos
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentHeat?.Allocations.filter(
                                (a) =>
                                  a.Result !== "DNF" && a.HeatRank !== null,
                              )
                                .sort(
                                  (a, b) =>
                                    (a.HeatRank || 999) - (b.HeatRank || 999),
                                )
                                .map((result) => (
                                  <tr
                                    key={result.AllocId}
                                    className="border-b transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <td className="px-4 py-3">
                                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                        {result.HeatRank}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex flex-col">
                                        <div className="flex items-center">
                                          <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                            {result.Number}
                                          </span>
                                          <span className="font-medium">
                                            {result.Name}
                                          </span>
                                        </div>
                                        <div className="text-muted-foreground mt-1 text-sm">
                                          {result.Organization.Name}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                      <div className="flex items-center">
                                        <span className="font-medium">
                                          {result.Result}
                                        </span>
                                        {result.QRank && (
                                          <Badge className="ml-2 bg-green-600 hover:bg-green-700">
                                            Q
                                          </Badge>
                                        )}
                                        {result.QResult && (
                                          <Badge className="ml-2 bg-green-600 hover:bg-green-700">
                                            q
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Overall Results */}
                <SectionHeader
                  title={
                    currentRound.RoundTypeCategory === "Final"
                      ? "Lopputulokset"
                      : "Kokonaistulokset"
                  }
                  icon={<Award className="text-blue-600" />}
                  size="md"
                  className="mb-4"
                />

                <EventDataTable
                  data={currentRound.TotalResults.filter(
                    (r) => r.Result !== "DNF" && r.ResultRank !== null,
                  ).sort(
                    (a, b) => (a.ResultRank || 999) - (b.ResultRank || 999),
                  )}
                  columns={[
                    {
                      key: "position",
                      header: "Sij.",
                      cell: (result) =>
                        result.ResultRank && result.ResultRank <= 3 ? (
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-full font-medium text-white",
                              result.ResultRank === 1
                                ? "bg-yellow-500"
                                : result.ResultRank === 2
                                  ? "bg-gray-400"
                                  : "bg-amber-700",
                            )}
                          >
                            {result.ResultRank}
                          </span>
                        ) : (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                            {result.ResultRank}
                          </span>
                        ),
                    },
                    {
                      key: "name",
                      header: "Nimi ja seura",
                      cell: (result) => (
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                              {result.Number}
                            </span>
                            <span className="font-medium">{result.Name}</span>
                          </div>
                          <div className="text-muted-foreground mt-1 text-sm">
                            {result.Organization.Name}
                          </div>
                        </div>
                      ),
                    },
                    {
                      key: "result",
                      header: "Tulos",
                      cell: (result) => (
                        <div className="flex items-center">
                          <span className="font-medium">{result.Result}</span>
                          {result.QRank && (
                            <Badge className="ml-2 bg-green-600 hover:bg-green-700">
                              Q
                            </Badge>
                          )}
                          {result.QResult && (
                            <Badge className="ml-2 bg-green-600 hover:bg-green-700">
                              q
                            </Badge>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  keyExtractor={(result) => result.AllocId}
                />
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No results available for this round yet.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
