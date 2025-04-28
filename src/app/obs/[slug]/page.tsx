"use client";
import { cn } from "~/@/lib/utils";
import { AnimatedList } from "~/@/components/animated-list";
import { api } from "~/trpc/react";
import { use } from "react";
import { Loader2Icon } from "lucide-react";

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

export default function Obs({ params }: { params: Promise<{ slug: string }> }) {
  const cachedParams = use(params ?? { slug: "" }) as { slug: string };
  const compId = cachedParams.slug?.replace("-", "/");
  const competitionDetailsId = cachedParams.slug?.split("-")[0];
  const obsAthletes = api.competition.getAthletes.useQuery(
    { compId },
    { refetchInterval: 1000 },
  );
  const obsCompetition = api.competition.getCompetitionDetails.useQuery({
    competitionDetailsId: competitionDetailsId!,
  });

  if (obsAthletes.isLoading || obsCompetition.isLoading) {
    return <Loader2Icon className="animate-spin" />;
  }

  if (obsAthletes.isError || obsCompetition.isError) {
    return <div className="text-red-500">Failed to load competition data</div>;
  }

  if (!obsAthletes.data || !obsCompetition.data) {
    return <div>No data available</div>;
  }

  return (
    <div className="-mx-2 max-w-xs text-gray-50">
      <div className="w-full max-w-xs border-t-2 border-cyan-300 bg-black/90">
        <h2 className="px-2 text-cyan-300 uppercase">
          {obsAthletes.data?.Rounds[0]?.Name}
        </h2>
        <div className="flex justify-between">
          <h3 className="bg-cyan-300 px-2 text-black uppercase">
            {obsAthletes.data?.Name}
          </h3>
          <h4 className="px-2 uppercase">Tulos</h4>
        </div>
        <AnimatedList>
          {obsAthletes.data?.Rounds.map((round) =>
            round.TotalResults.sort((a, b) => {
              const resultA = butterParse(a.Result);
              const resultB = butterParse(b.Result);
              console.log(
                `${a.Name} ResultA: ${resultA} unformatted: ${a.Result}`,
              );
              console.log(
                `${b.Name} ResultB: ${resultB} unformatted: ${b.Result}`,
              );
              if (resultA === null || resultB === null) {
                return -1;
              } else if (resultA === -1) {
                return 1;
              } else if (resultB === -1) {
                return -1;
              } else if (resultA === 0) {
                return 1;
              } else if (resultB === 0) {
                return -1;
              } else {
                return resultA > resultB ? -1 : 1;
              }
            }).map((a) => (
              <li
                key={a.Id}
                className="flex flex-wrap justify-between border-t-2 border-black/50"
              >
                <div className="flex flex-[1_1_100%] justify-between px-4 py-1">
                  {a.Name}
                  <span>{a.Result}</span>
                </div>
                {a.Attempts.length > 1 && (
                  <ul
                    className={cn(
                      "ml-1 flex-[1_1_100%] bg-gray-300 text-black",
                      a.Id ? "flex" : "hidden",
                    )}
                  >
                    {a.Attempts === null ? (
                      <p className="opacity-0">no</p>
                    ) : (
                      a.Attempts?.map((at, idx) => (
                        <li
                          key={idx}
                          className={cn(
                            a.Result === at.Line1 && "bg-cyan-300/50!",
                            "flex min-w-[16.7%] flex-col px-1 py-2 even:bg-gray-200",
                          )}
                        >
                          <span>{at.Line1}</span>
                          {at.Line2 && <span>{at.Line2}</span>}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </li>
            )),
          )}
        </AnimatedList>
      </div>
      <h1 className="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">
        {obsCompetition.data?.Competition.Name}
      </h1>
    </div>
  );
}
