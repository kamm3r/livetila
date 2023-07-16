"use client";
import { Card, CardContent, CardHeader } from "../@/components/ui/card";
import { useQuery as tfue } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Competition } from "../types/comp";
import Image from "next/image";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../@/components/ui/table";

function butterParse(a: string): number {
  if (Number.isNaN(a)) {
    return 0;
  } else {
    return parseFloat(a);
  }
}
export function AthleteCard() {
  const params = useParams() as {
    compId: string;
    deez: string;
  };

  const { isLoading: victoryRoyaleIsLoading, data: victoryRoyale } = tfue({
    queryKey: ["victory-royale"],
    queryFn: () =>
      fetch(
        `https://cached-public-api.tuloslista.com/live/v1/results/${params.compId}/${params.deez}`
      ).then((res) => res.json()) as Promise<Competition>,
  });

  if (!victoryRoyale || victoryRoyaleIsLoading) return "Loading...";
  console.log("victoryRoyale", victoryRoyale);
  return (
    <Tabs defaultValue="ilmo" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="ilmo">Ilmoitautuneet</TabsTrigger>
        <TabsTrigger value="par">Poytakirja</TabsTrigger>
        <TabsTrigger value="result">Tulokset</TabsTrigger>
      </TabsList>
      <TabsContent value="ilmo">
        {victoryRoyale.Rounds.map((r) =>
          r.Heats.map((h) =>
            h.Allocations.sort(
              (a, b) => parseFloat(b.Result) - parseFloat(a.Result)
            ).map((a, i) => (
              <li
                key={i}
                // className="rounded border border-neutral-900 bg-neutral-800 shadow relative flex flex-col gap-4 p-4"
              >
                <Card className="w-full max-w-[400px]">
                  <CardHeader className="flex-row items-center gap-3">
                    {a.Organization.NameShort && (
                      <picture className="w-10">
                        <source
                          srcSet={`https://www.tilastopaja.eu/fi/db/pics/png/${a.Organization.NameShort}.png`}
                        />
                        <source
                          srcSet={`https://www.tilastopaja.eu/fi/db/pics/png/${a.Organization.Name.replace(
                            " ",
                            ""
                          )}.png`}
                        />
                        <Image
                          src={`https://www.tilastopaja.eu/fi/db/pics/png/${a.Organization.NameShort}.png`}
                          alt="Club Logo"
                          width={40}
                          height={40}
                        />
                      </picture>
                    )}
                    <div className="flex items-center gap-3 break-words">
                      <p>{a.Name}</p>
                      <span className="text-xs opacity-70">
                        PB: {a.PB || "-"} SB: {a.SB || "-"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex gap-2">
                      {a.Attempts
                        ? a.Attempts.map((at, id) => (
                            <li
                              key={id}
                              className="-my-1 rounded bg-neutral-600/50 px-2 py-1 text-sm"
                            >
                              {at.Line1}
                            </li>
                          ))
                        : "no bitch"}
                    </ul>
                  </CardContent>
                </Card>
              </li>
            ))
          )
        )}
      </TabsContent>
      <TabsContent value="par">
        <Table className="relative">
          <TableHeader className="sticky top-0 backdrop-blur-md">
            <TableRow>
              <TableHead className="w-[100px]">jarj</TableHead>
              <TableHead>Nimi</TableHead>
              <TableHead>Seura</TableHead>
              <TableHead>PB</TableHead>
              <TableHead>SB</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {victoryRoyale.Rounds.map((r) =>
              r.Heats.map((h) =>
                h.Allocations.sort(
                  (a, b) => parseFloat(b.Result) - parseFloat(a.Result)
                ).map((a, i) => (
                  <TableRow className="w-full max-w-[400px]" key={i}>
                    <TableCell>{a.Position}</TableCell>
                    <TableCell>{a.Name}</TableCell>
                    <TableCell>{a.Organization.Name}</TableCell>
                    <TableCell>{a.PB || "-"}</TableCell>
                    <TableCell>{a.SB || "-"}</TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </TabsContent>
      <TabsContent value="result">
        <Table className="relative">
          <TableHeader className="sticky top-0 backdrop-blur-md">
            <TableRow>
              <TableHead className="w-[100px]">Sija</TableHead>
              <TableHead>Nimi</TableHead>
              <TableHead>Seura</TableHead>
              <TableHead>Tulos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {victoryRoyale.Rounds.map((r) =>
              r.Heats.map((h) =>
                h.Allocations.sort((a, b) => {
                  console.log("res", a.Result);
                  return a.ResultRank! - b.ResultRank!;
                  // return butterParse(b.Result) - butterParse(a.Result);
                }).map((a, i) => (
                  <TableRow className="w-full max-w-[400px]" key={i}>
                    <TableCell>{a.ResultRank}</TableCell>
                    <TableCell>{a.Name}</TableCell>
                    <TableCell>{a.Organization.Name}</TableCell>
                    <TableCell>
                      <ul className="flex gap-2">
                        {a.Attempts
                          ? a.Attempts.map((at, id) => (
                              <li
                                key={id}
                                className="-my-1 rounded bg-neutral-600/50 px-2 py-1 text-sm"
                              >
                                {at.Line1.toUpperCase()}
                              </li>
                            ))
                          : "no bitch"}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
}
