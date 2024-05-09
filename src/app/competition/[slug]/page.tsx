import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";
import { InfoIcon, Loader2Icon } from "lucide-react";
import { Button } from "~/@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/@/components/ui/popover";
import { Navbar } from "~/@/components/navbar";
import { Embed } from "~/@/components/embed";
import { api } from "~/trpc/server";
import { Suspense } from "react";
import { Skeleton } from "~/@/components/ui/skeleton";

function butterParse(a: string): number {
  if (a === "NM" || Number.isNaN(a)) {
    return 0;
  } else if (a === null) {
    return 0;
  } else if (a === "DNS" || a === "DQ" || a === "DNF" || a === "DSQ") {
    return 0;
  } else {
    return parseFloat(a);
  }
}

export default async function Comp({ params }: { params: { slug: string } }) {
  const compId = params.slug?.replace("-", "/");
  const athletes = await api.competition.getAthletes({ compId });
  return (
    <>
      <Navbar />
      <main className="relative flex flex-grow flex-col p-4 sm:p-8">
        <Popover>
          <PopoverTrigger asChild className=" right-5 top-9 z-50">
            <Button variant="ghost" className="px-2" size="icon">
              <InfoIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">OBS Overlay</h4>
                <p className="text-sm text-muted-foreground">
                  Get your live stream overlay for track and field
                </p>
              </div>
              <div className="flex gap-4">
                <Embed slug={params.slug} />
              </div>
            </div>
          </PopoverContent>
        </Popover>
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
              {athletes.Rounds.map((r) =>
                r.Heats.map((h) =>
                  h.Allocations.sort((a, b) => {
                    if (
                      butterParse(a.Result) === null ||
                      butterParse(b.Result) === null
                    ) {
                      return -1;
                    } else if (butterParse(a.Result) === 0) {
                      return 1;
                    } else if (butterParse(b.Result) === 0) {
                      return -1;
                    } else {
                      return butterParse(a.Result) > butterParse(b.Result)
                        ? -1
                        : 1;
                    }
                  }).map((a, i) => (
                    <TableRow className="w-full max-w-[400px]" key={i}>
                      <Suspense>
                        <TableCell>{a.ResultRank}</TableCell>
                        <TableCell>{a.Name}</TableCell>
                        <TableCell>{a.Organization.Name}</TableCell>
                        <TableCell>
                          <ul className="flex gap-2">
                            <Suspense fallback={<Skeleton />}>
                              {a.Attempts
                                ? a.Attempts.map((at, id) => (
                                    <li
                                      key={id}
                                      className="-my-1 flex flex-col rounded bg-neutral-600/50 px-2 py-1 text-sm"
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
                  )),
                ),
              )}
            </Suspense>
          </TableBody>
        </Table>
        <div>
          <ul className="flex flex-col gap-3 lg:hidden">
            <Suspense fallback={<Loader2Icon className="animate-spin" />}>
              {athletes.Rounds.map((r) =>
                r.Heats.map((h) =>
                  h.Allocations.sort((a, b) => {
                    if (
                      butterParse(a.Result) === null ||
                      butterParse(b.Result) === null
                    ) {
                      return -1;
                    } else if (butterParse(a.Result) === 0) {
                      return 1;
                    } else if (butterParse(b.Result) === 0) {
                      return -1;
                    } else {
                      return butterParse(a.Result) > butterParse(b.Result)
                        ? -1
                        : 1;
                    }
                  }).map((a, i) => (
                    <li
                      className="flex w-full max-w-[400px] flex-col gap-1 rounded border px-4 py-3"
                      key={i}
                    >
                      <Suspense>
                        <h2 className="text-2xl font-semibold leading-none tracking-tight">
                          <span>{a.ResultRank}</span> <span>{a.Name}</span>
                        </h2>
                        <span className="text-xs opacity-70">
                          PB: {a.PB} SB: {a.SB}
                        </span>
                        <p className="pb-2 text-sm text-muted-foreground">
                          {a.Organization.Name}
                        </p>
                        <ul className="flex gap-2">
                          <Suspense fallback={<Skeleton />}>
                            {a.Attempts
                              ? a.Attempts.map((at, id) => (
                                  <li
                                    key={id}
                                    className="-my-1 flex flex-col rounded bg-muted px-2 py-1 text-sm dark:bg-neutral-600/50"
                                  >
                                    <span>{at.Line1}</span>
                                    {at.Line2 && <span>{at.Line2}</span>}
                                  </li>
                                ))
                              : null}
                          </Suspense>
                        </ul>
                      </Suspense>
                    </li>
                  )),
                ),
              )}
            </Suspense>
          </ul>
        </div>
      </main>
    </>
  );
}
