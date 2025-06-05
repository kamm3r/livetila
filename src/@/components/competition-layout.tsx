"use client";
import { Suspense } from "react";
import { useRound } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
import { Skeleton } from "~/@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";
import { cn } from "~/@/lib/utils";

export function CompetitionLayout() {
  const {
    currentHeat,
    selectedRound,
    selectedHeat,
    heats,
    showHeatNumbers,
    handleHeatChange,
  } = useRound();
  return (
    <>
      {heats.length > 0 ? (
        <div className="space-y-6">
          {/* Heat Selection Tabs - Only show when there are multiple heats */}
          {showHeatNumbers && heats.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="mb-2 w-full text-sm text-muted-foreground">
                Valiste erä:
              </div>
              {heats.map((heat) => (
                <Button
                  key={heat.Index}
                  variant={selectedHeat === heat.Index ? "default" : "outline"}
                  onClick={() => handleHeatChange(heat.Index)}
                >
                  Erä {heat.Index}
                </Button>
              ))}
            </div>
          )}
          <Table className="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block">
            <TableHeader className="sticky top-0 backdrop-blur-md">
              <TableRow>
                <TableHead className="w-[100px]">Sija</TableHead>
                <TableHead className="w-full">Nimi ja Seura</TableHead>
                <TableHead>PB</TableHead>
                <TableHead>SB</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Suspense>
                {currentHeat?.Allocations.sort(
                  (a, b) => a.Position - b.Position,
                ).map((allocation) => (
                  <TableRow
                    className="w-full max-w-[400px]"
                    key={allocation.Id}
                  >
                    <Suspense>
                      <TableCell>{allocation.Position}</TableCell>
                      <TableCell>
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
                          <div className="mt-1 text-xs text-muted-foreground">
                            {!!allocation.Organization
                              ? allocation.Organization.Name
                              : "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {allocation.PB || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {allocation.SB || "-"}
                        </span>
                      </TableCell>
                    </Suspense>
                  </TableRow>
                ))}
              </Suspense>
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            Eräjakoja ei ole saatavilla vielä.
          </p>
        </div>
      )}
    </>
  );
}
export function ResultLayout() {
  const {
    currentHeat,
    selectedRound,
    selectedHeat,
    heats,
    showHeatNumbers,
    handleHeatChange,
  } = useRound();
  return (
    <>
      {heats.length > 0 ? (
        <div className="space-y-6">
          {/* Heat Selection Tabs - Only show when there are multiple heats */}
          {showHeatNumbers && heats.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="mb-2 w-full text-sm text-muted-foreground">
                Valiste erä:
              </div>
              {heats.map((heat) => (
                <Button
                  key={heat.Index}
                  variant={selectedHeat === heat.Index ? "default" : "outline"}
                  onClick={() => handleHeatChange(heat.Index)}
                >
                  Erä {heat.Index}
                </Button>
              ))}
            </div>
          )}
          <Table className="relative hidden rounded-md border md:block">
            <TableHeader className="sticky top-0 backdrop-blur-md">
              <TableRow>
                <TableHead className="w-[100px]">Sija</TableHead>
                <TableHead className="w-full">Nimi ja Seura</TableHead>
                <TableHead className="w-full">Tulos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto">
              <Suspense>
                {currentHeat?.Allocations.sort(
                  (a, b) => a.ResultRank! - b.ResultRank!,
                ).map((allocation) => (
                  <TableRow
                    className="w-full max-w-[400px]"
                    key={allocation.Id}
                  >
                    <Suspense>
                      <TableCell>{allocation.Position}</TableCell>
                      <TableCell>
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
                          <div className="mt-1 text-xs text-muted-foreground">
                            {!!allocation.Organization
                              ? allocation.Organization.Name
                              : "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ul className="flex gap-2">
                          <Suspense fallback={<Skeleton />}>
                            {allocation.Attempts
                              ? allocation.Attempts.map((at, id) => (
                                  <li
                                    key={id}
                                    className={cn(
                                      allocation.Result === at.Line1 &&
                                        "!bg-neutral-300/50",
                                      "-my-1 flex flex-col rounded bg-neutral-600/50 px-2 py-1 text-sm",
                                    )}
                                  >
                                    <span>{at.Line1}</span>
                                    {at.Line2 && <span>{at.Line2}</span>}
                                  </li>
                                ))
                              : null}
                          </Suspense>
                        </ul>
                      </TableCell>
                    </Suspense>
                  </TableRow>
                ))}
              </Suspense>
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            Eräjakoja ei ole saatavilla vielä.
          </p>
        </div>
      )}
    </>
  );
}
