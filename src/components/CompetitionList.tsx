"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../@/components/ui/table";
import { CompetitionList } from "../types/comp";

export function Bus() {
  const socket = new WebSocket("ws://localhost:3000/api/ws");
  socket.onopen = () => {
    console.log("here");
  };
  const { isLoading, data } = useQuery({
    queryKey: ["competitions"],
    queryFn: () =>
      fetch(
        "https://cached-public-api.tuloslista.com/live/v1/competition"
      ).then((res) => res.json()) as Promise<CompetitionList[]>,
  });

  // const [, setValue] = useAtom(compsAtom);
  const sortedData = data?.sort((a, b) => {
    const aDate = new Date(a.Date);
    const bDate = new Date(b.Date);
    return aDate < bDate ? 1 : -1;
  });
  if (isLoading) return "Loading...";
  // scroll vertically, content size as the window with "local y scrollbar"
  return (
    <div className="row-span-1 flex sm:col-span-2 flex-col flex-1 gap-5">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        Kilpailut
      </h3>
      <Table className="relative">
        <TableHeader className="sticky top-0 backdrop-blur-md">
          <TableRow>
            <TableHead className="w-[100px]">Päivämäärä</TableHead>
            <TableHead>Kilpailun nimi</TableHead>
            <TableHead>Seura</TableHead>
            <TableHead className="text-right">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="overflow-y-auto">
          {sortedData?.map((comp) => (
            <TableRow key={comp.Id}>
              <TableCell className="font-medium">
                {new Date(comp.Date).toLocaleString("fi-FI", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>{comp.Name}</TableCell>
              <TableCell>{comp.OrganizationName}</TableCell>
              <TableCell className="text-right text-blue-500 underline">
                <Link href={`/${comp.Id}`}>Link</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption className="sticky bottom-0 backdrop-blur-md">
          Kilpailut
        </TableCaption>
      </Table>
    </div>
  );
}
