"use client";

import { useEffect, useMemo } from "react";
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
import { Award, CheckCircle, Trophy, ClipboardList, Users } from "lucide-react";
import { cn } from "~/@/lib/utils";
import { EventDataTable } from "./event-data-table";
import { SectionHeader } from "./section-header";
import { type Competition } from "~/types/comp";
import { useRound } from "~/@/components/round-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";

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

  // Determine if this is a field event with multiple attempts
  const isFieldEvent = eventData.EventType.Category === "Field";

  // Check if we have attempts data to display
  const hasAttemptsData = useMemo(() => {
    if (!currentRound?.TotalResults) return false;

    return currentRound.TotalResults.some(
      (result) =>
        result.Attempts &&
        result.Attempts.length > 0 &&
        result.Attempts.some((attempt) => attempt.Line1),
    );
  }, [currentRound]);

  return (
    <div className="container mx-auto py-6">
      {/* Main Tabs */}
      <Tabs defaultValue="participants" className="mt-2 w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 bg-transparent p-0">
          <TabsTrigger
            value="participants"
            className="data-[state=active]:bg-background data-[state=active]:border-primary hover:border-primary/70 hover:text-foreground/70 text-muted-foreground data-[state=active]:text-foreground rounded-none border-b-2 border-transparent py-3 data-[state=active]:shadow-none"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border">
                <Users className="h-3 w-3" />
              </span>
              <span className="hidden sm:block">Ilmoittautuneet</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="protocol"
            className="data-[state=active]:bg-background data-[state=active]:border-primary hover:border-primary/70 hover:text-foreground/70 text-muted-foreground data-[state=active]:text-foreground rounded-none border-b-2 border-transparent py-3 data-[state=active]:shadow-none"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border">
                <ClipboardList className="h-3 w-3" />
              </span>
              <span className="hidden sm:block">Pöytäkirjat</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="data-[state=active]:bg-background data-[state=active]:border-primary text-muted-foreground data-[state=active]:text-foreground hover:border-primary/70 hover:text-foreground/70 rounded-none border-b-2 border-transparent py-3 data-[state=active]:shadow-none"
          >
            <div className="flex items-center justify-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border">
                <Trophy className="h-3 w-3" />
              </span>
              <span className="hidden sm:block">Tulokset</span>
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
                header: "Nimi ja Seura",
                cell: (participant) => (
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      {!!participant.Number && (
                        <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                          {participant.Number}
                        </span>
                      )}
                      <span className="font-medium">{participant.Name}</span>
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {!!participant.Organization
                        ? participant.Organization.Name
                        : "-"}
                    </div>
                  </div>
                ),
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
              participant.Confirmed ? "bg-green-50/70 dark:bg-green-900/10" : ""
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
                    >
                      Heat {heat.Index}
                    </Button>
                  ))}
                </div>
              )}

              {/* Current Heat */}
              <Card className="overflow-hidden border-0 shadow-md">
                <CardContent className="p-0">
                  <EventDataTable
                    data={currentHeat?.Allocations ?? []}
                    columns={[
                      {
                        key: "position",
                        header:
                          showHeatNumbers && heats.length > 1 ? "Rata" : "Järj",
                        cell: (allocation) => (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full font-medium">
                            {allocation.Position}
                          </span>
                        ),
                      },
                      {
                        key: "name",
                        header: "Nimi ja seura",
                        cell: (allocation) => (
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {!!allocation.Number && (
                                <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                  {allocation.Number}
                                </span>
                              )}
                              <span className="font-medium">
                                {allocation.Name}
                              </span>
                            </div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              {!!allocation.Organization
                                ? allocation.Organization.Name
                                : "-"}
                            </div>
                          </div>
                        ),
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
                </CardContent>
              </Card>
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sij.</TableHead>
                            <TableHead>Nimi ja seura</TableHead>
                            <TableHead>Tulos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentHeat?.Allocations.filter(
                            (a) => a.Result !== "DNF" && a.HeatRank !== null,
                          )
                            .sort(
                              (a, b) =>
                                (a.HeatRank ?? 999) - (b.HeatRank ?? 999),
                            )
                            .map((result) => (
                              <TableRow
                                key={result.AllocId}
                                className="border-b"
                              >
                                <TableCell>
                                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full font-medium">
                                    {result.HeatRank}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <div className="flex items-center">
                                      {!!result.Number && (
                                        <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                          {result.Number}
                                        </span>
                                      )}
                                      <span className="font-medium">
                                        {result.Name}
                                      </span>
                                    </div>
                                    <div className="text-muted-foreground mt-1 text-xs">
                                      {result.Organization.Name}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
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
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
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

              {/* Field Event with Attempts */}
              {isFieldEvent && hasAttemptsData ? (
                <Card className="overflow-hidden border-0 shadow-md">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sij.</TableHead>
                          <TableHead>Nimi ja seura</TableHead>
                          <TableHead className="text-center">tulos</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRound.TotalResults.filter(
                          (r) => r.Result !== "DNF" && r.ResultRank !== null,
                        )
                          .sort(
                            (a, b) =>
                              (a.ResultRank ?? 999) - (b.ResultRank ?? 999),
                          )
                          .map((result) => (
                            <TableRow key={result.AllocId}>
                              <TableCell>
                                {result.ResultRank && result.ResultRank <= 3 ? (
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
                                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full font-medium">
                                    {result.ResultRank}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    {!!result.Number && (
                                      <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                        {result.Number}
                                      </span>
                                    )}
                                    <span className="text-muted-foreground font-medium">
                                      {result.Name}
                                    </span>
                                  </div>
                                  <div className="text-muted-foreground mt-1 text-xs">
                                    {result.Organization.Name}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <span className="text-lg font-bold">
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
                              </TableCell>
                              <TableCell>
                                {result.Attempts &&
                                result.Attempts.length > 0 ? (
                                  <div className="flex flex-col">
                                    {/* First row: measurements */}
                                    <div className="mb-1 flex justify-start space-x-4">
                                      {result.Attempts.map((attempt, idx) => (
                                        <div
                                          key={idx}
                                          className={cn(
                                            "min-w-10 px-1 text-center",
                                            attempt.Line1 === result.Result
                                              ? "font-bold text-blue-600"
                                              : "",
                                          )}
                                        >
                                          {attempt.Line1 || "-"}
                                        </div>
                                      ))}
                                    </div>

                                    {/* Second row: attempt status (o, x, xo, etc.) */}
                                    {result.Attempts.some((a) => a.Line2) && (
                                      <div className="flex justify-start space-x-4">
                                        {result.Attempts.map((attempt, idx) => (
                                          <div
                                            key={idx}
                                            className="min-w-10 px-1 text-center text-sm"
                                          >
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <span
                                                    className={cn(
                                                      attempt.Line2 === "o"
                                                        ? "text-green-600"
                                                        : attempt.Line2 === "x"
                                                          ? "text-red-600"
                                                          : attempt.Line2?.includes(
                                                                "x",
                                                              )
                                                            ? "text-amber-600"
                                                            : "",
                                                    )}
                                                  >
                                                    {attempt.Line2 || "-"}
                                                  </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <div className="text-xs">
                                                    {attempt.Line2 === "o"
                                                      ? "Successful on first attempt"
                                                      : attempt.Line2 === "x"
                                                        ? "Failed attempt"
                                                        : attempt.Line2 === "xo"
                                                          ? "Successful on second attempt"
                                                          : attempt.Line2 ===
                                                              "xxo"
                                                            ? "Successful on third attempt"
                                                            : attempt.Line2 ===
                                                                "-"
                                                              ? "No attempt"
                                                              : "Attempt result"}
                                                  </div>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground text-center">
                                    -
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <EventDataTable
                  data={currentRound.TotalResults.filter(
                    (r) => r.Result !== "DNF" && r.ResultRank !== null,
                  ).sort(
                    (a, b) => (a.ResultRank ?? 999) - (b.ResultRank ?? 999),
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
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full font-medium">
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
                            {!!result.Number && (
                              <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                {result.Number}
                              </span>
                            )}
                            <span className="font-medium">{result.Name}</span>
                          </div>
                          <div className="text-muted-foreground mt-1 text-xs">
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
              )}
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
  );
}
