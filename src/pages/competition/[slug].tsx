import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";
import { InfoIcon } from "lucide-react";
import { Button } from "~/@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/@/components/ui/popover";
import { Navbar } from "../_components/navbar";
import { Embed } from "../_components/embed";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

function butterParse(a: string): number {
  if (Number.isNaN(a)) {
    return 0;
  } else {
    return parseFloat(a);
  }
}

export default function Comp() {
  const router = useRouter();
  const params = router.query as { slug: string };
  const compId = params.slug?.replace("-", "/");
  const athletes = api.competition.getAthletes.useQuery(
    { compId },
    { refetchInterval: 1000 },
  );
  if (athletes.isLoading || !athletes.data) {
    return <div>Loading...</div>;
  }
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
            {athletes.data.Rounds.map((r) =>
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
                          : null}
                      </ul>
                    </TableCell>
                  </TableRow>
                )),
              ),
            )}
          </TableBody>
        </Table>
        <div>
          <ul className="flex flex-col gap-3 lg:hidden">
            {athletes.data.Rounds.map((r) =>
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
                    <h2 className="text-2xl font-semibold leading-none tracking-tight">
                      <span>{a.ResultRank}</span> {a.Name}
                    </h2>
                    <p className="pb-2 text-sm text-muted-foreground">
                      {a.Organization.Name}
                    </p>
                    <ul className="flex gap-2">
                      {a.Attempts
                        ? a.Attempts.map((at, id) => (
                            <li
                              key={id}
                              className="-my-1 rounded bg-muted px-2 py-1 text-sm dark:bg-neutral-600/50"
                            >
                              {at.Line1.toUpperCase()}
                            </li>
                          ))
                        : null}
                    </ul>
                  </li>
                )),
              ),
            )}
          </ul>
        </div>
      </main>
    </>
  );
}
