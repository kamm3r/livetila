import { useRouter } from "next/router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";
import { api } from "~/utils/api";

function butterParse(a: string): number {
  if (Number.isNaN(a)) {
    return 0;
  } else {
    return parseFloat(a);
  }
}

export default function Comp() {
  const router = useRouter();
  const compId = (router.query.slug as string)?.replace("-", "/");
  const { data, isLoading } = api.competition.getAthletes.useQuery(
    { compId },
    { refetchInterval: 1000 },
  );
  if (!data || isLoading) {
    return "loading...";
  }
  console.log("data", data);
  return (
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
        {data.Rounds.map((r) =>
          r.Heats.map((h) =>
            h.Allocations.sort(
              (a, b) => butterParse(b.Result) - butterParse(a.Result),
            ).map((a, i) => (
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
            )),
          ),
        )}
      </TableBody>
    </Table>
  );
}
