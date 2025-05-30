"use client";
import { Suspense } from "react";
import { useRound } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";

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
                Select heat:
              </div>
              {heats.map((heat) => (
                <Button
                  key={heat.Index}
                  variant={selectedHeat === heat.Index ? "default" : "outline"}
                  onClick={() => handleHeatChange(heat.Index)}
                >
                  Heat {heat.Index}
                </Button>
              ))}
            </div>
          )}
          <Table className="relative hidden lg:block">
            <TableHeader className="sticky top-0 backdrop-blur-md">
              <TableRow>
                <TableHead className="w-[100px]">Sija</TableHead>
                <TableHead>Nimi</TableHead>
                <TableHead>Seura</TableHead>
                <TableHead>Tulos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="overflow-y-auto">
              <Suspense>
                {currentHeat?.Allocations.map((allocation) => (
                  <TableRow
                    className="w-full max-w-[400px]"
                    key={allocation.Id}
                  >
                    <Suspense>
                      <TableCell>{allocation.Position}</TableCell>
                      <TableCell>{allocation.Name}</TableCell>
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
