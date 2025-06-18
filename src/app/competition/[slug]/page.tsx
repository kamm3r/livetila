import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";
import {
  ClipboardList,
  InfoIcon,
  Loader2Icon,
  Trophy,
  Users,
} from "lucide-react";
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
import { Separator } from "~/@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/@/components/ui/tabs";
import { RoundProvider, useRound } from "~/@/components/round-provider";
import {
  CompetitionLayout,
  ResultLayout,
} from "~/@/components/competition-layout";
import { cn } from "~/@/lib/utils";

function butterParse(a: string): number {
  if (a === "NM" || Number.isNaN(a)) {
    return 0;
  } else if (a === null) {
    return 0;
  } else if (a === "DNS" || a === "DQ" || a === "DNF" || a === "DSQ") {
    return -1;
  } else {
    return parseFloat(a);
  }
}
function ObsPopover({ params }: { params: { slug: string } }) {
  return (
    <Popover>
      <PopoverTrigger asChild className="right-5 top-9 z-50">
        <Button variant="ghost" className="px-2" size="icon">
          <InfoIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">OBS Overlay</h4>
            <p className="text-sm text-muted-foreground">
              jos haluut näyttää vain tietyn erän tulokset niin tee näin
            </p>
            <Separator className="" />
            <div className="break-all rounded-lg border bg-popover-foreground/10 p-3 pr-12 font-mono text-sm text-gray-300">
              https://livetila.vercel.app/obs/{params.slug}
              <span className="rounded bg-cyan-300/40 px-1 py-0.5 text-white">
                ?heat=1
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <Embed slug={params.slug} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default async function Comp({ params }: { params: { slug: string } }) {
  console.log("Comp params:", params.slug);
  const compId = params.slug?.replace("-", "/");
  const athletes = await api.competition.getAthletes({ compId });

  return (
    <RoundProvider rounds={athletes.Rounds}>
      <Navbar />
      <main className="container relative mx-auto flex flex-grow flex-col p-4 sm:p-8">
        <ObsPopover params={params} />
        <Tabs defaultValue="participants" className="mt-2 w-full">
          <TabsList className="grid h-auto w-full grid-cols-3 bg-transparent p-0">
            <TabsTrigger
              value="participants"
              className="rounded-none border-b-2 border-transparent py-3 text-muted-foreground hover:border-primary/70 hover:text-foreground/70 data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
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
              className="rounded-none border-b-2 border-transparent py-3 text-muted-foreground hover:border-primary/70 hover:text-foreground/70 data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
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
              className="rounded-none border-b-2 border-transparent py-3 text-muted-foreground hover:border-primary/70 hover:text-foreground/70 data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border">
                  <Trophy className="h-3 w-3" />
                </span>
                <span className="hidden sm:block">Tulokset</span>
              </div>
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="participants"
            className="duration-300 animate-in fade-in-50"
          >
            <Table className="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block">
              <TableHeader className="sticky top-0 backdrop-blur-md">
                <TableRow>
                  <TableHead>Varm.</TableHead>
                  <TableHead className="w-full">Nimi ja Seura</TableHead>
                  <TableHead>PB</TableHead>
                  <TableHead>SB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Suspense>
                  {athletes.Enrollments.map((participant) => (
                    <TableRow key={participant.Id}>
                      <Suspense>
                        <TableCell>{participant.Confirmed}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {!!participant.Number && (
                                <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                  {participant.Number}
                                </span>
                              )}
                              <span className="font-medium">
                                {participant.Name}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {!!participant.Organization
                                ? participant.Organization.Name
                                : "-"}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-medium">
                            {participant.PB || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {participant.SB || "-"}
                          </span>
                        </TableCell>
                      </Suspense>
                    </TableRow>
                  ))}
                </Suspense>
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent
            value="protocol"
            className="duration-300 animate-in fade-in-50"
          >
            <CompetitionLayout />
          </TabsContent>
          <TabsContent
            value="results"
            className="space-y-5 duration-300 animate-in fade-in-50"
          >
            <ResultLayout />

            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Kokonaistulokset
            </h3>
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
                  {athletes.Rounds.map((r) =>
                    r.TotalResults.sort((a, b) => {
                      if (
                        butterParse(a.Result) === null ||
                        butterParse(b.Result) === null
                      ) {
                        return -1;
                      } else if (butterParse(a.Result) === -1) {
                        return 1;
                      } else if (butterParse(b.Result) === -1) {
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
                    }).map((allocation) => (
                      <TableRow className="" key={allocation.Id}>
                        <Suspense>
                          <TableCell>{allocation.ResultRank}</TableCell>
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
                    )),
                  )}
                </Suspense>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
        <div>
          <ul className="flex flex-col gap-3 md:hidden">
            <Suspense fallback={<Loader2Icon className="animate-spin" />}>
              {athletes.Rounds.map((r) =>
                r.TotalResults.sort((a, b) => {
                  if (
                    butterParse(a.Result) === null ||
                    butterParse(b.Result) === null
                  ) {
                    return -1;
                  } else if (butterParse(a.Result) === -1) {
                    return 1;
                  } else if (butterParse(b.Result) === -1) {
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
              )}
            </Suspense>
          </ul>
        </div>
      </main>
    </RoundProvider>
  );
}
