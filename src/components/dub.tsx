"use client";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../@/components/ui/tabs";
import { CompetitionList, Events } from "../types/comp";
import { getData } from "../utils/getData";
import { Badge } from "../@/components/ui/badge";
import {
  useQuery as eventQuery,
  useQuery as compQuery,
} from "@tanstack/react-query";

export function Dub({ compId }: { compId: string }) {
  const { data: compData } = compQuery({
    queryKey: ["comp"],
    queryFn: () =>
      fetch(
        `https://cached-public-api.tuloslista.com/live/v1/competition/`
      ).then((res) => res.json()) as Promise<CompetitionList[]>,
  });
  const arrayname = compData?.find((comp) => comp.Id.toString() === compId);
  const { isLoading: eventIsLoading, data: eventData } = eventQuery({
    queryKey: ["event"],
    queryFn: () =>
      fetch(
        `https://cached-public-api.tuloslista.com/live/v1/competition/${compId}`
      ).then((res) => res.json()) as Promise<Events[]>,
  });

  if (!eventData || eventIsLoading) {
    return "loading...";
  }
  const dates = Object.keys(eventData);
  console.log("dates", dates);
  console.log("dates length", dates.length);

  return (
    <>
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        Kilpailu <span className="opacity-70 text-base">{arrayname?.Name}</span>
      </h3>
      <Tabs
        defaultValue={dates[0]!}
        className="relative w-full overflow-y-auto"
      >
        {dates.length > 1 && (
          <div className="sticky top-0 flex items-center justify-between pb-3">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              {dates.map((d, i) => (
                <TabsTrigger
                  value={d}
                  key={i}
                  className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {d}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        )}
        {dates.map((d, i) => (
          <TabsContent value={d} key={i} className="mt-0">
            <Table className="relative">
              <TableHeader className="sticky top-0 backdrop-blur-md">
                <TableRow>
                  <TableHead className="w-[100px]">Aika</TableHead>
                  <TableHead>Laji</TableHead>
                  <TableHead>Kierros</TableHead>
                  <TableHead className="text-right">Tila</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-y-auto">
                {/* @ts-ignore */}
                {eventData[d]?.map((e) => (
                  <TableRow key={e.Id}>
                    <Link href={`/${compId}/${e.Id}`} className="hidden" />
                    <TableCell className="font-medium">
                      {new Date(e.BeginDateTimeWithTZ).toLocaleString("fi-FI", {
                        hour: "numeric",
                        minute: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{e.EventName}</TableCell>
                    <TableCell>{e.Name}</TableCell>
                    <TableCell className="text-right">
                      {e.Status === "Allocated" ? (
                        <Badge className="bg-green-700 hover:bg-green-800 text-white">
                          Eräjaot tehty
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-yellow-700 text-white"
                        >
                          Eräjaot puuttuvat
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-blue-500 underline">
                      <Link href={`/${compId}/${e.Id}`}>Link</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="sticky bottom-0 backdrop-blur-md">
                Lajit
              </TableCaption>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
