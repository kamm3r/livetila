import { cn } from "~/@/lib/utils";
import { AnimatedList } from "../_components/animated-list";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

function butterParse(a: string): number {
  if (a === "NM" || Number.isNaN(a)) {
    return 0;
  } else {
    return parseFloat(a);
  }
}

export default function Obs() {
  const router = useRouter();
  const params = router.query as { slug: string };
  const compId = params.slug?.replace("-", "/");
  const competitionDetailsId = params.slug?.split("-")[0];
  const obsAthletes = api.competition.getAthletes.useQuery(
    { compId },
    { refetchInterval: 1000 },
  );
  const obsCompetition = api.competition.getCompetitionDetails.useQuery({
    competitionDetailsId: competitionDetailsId!,
  });
  return (
    <>
      <div className="max-w-xs text-gray-50">
        <div className="w-full max-w-xs border-t-2 border-cyan-300 bg-black/90">
          <h2 className="px-2 uppercase text-cyan-300">
            {obsAthletes.data?.Rounds[0]?.Name}
          </h2>
          <div className="flex justify-between">
            <h3 className="bg-cyan-300 px-2 uppercase text-black">
              {obsAthletes.data?.Name}
            </h3>
            <h4 className="px-2 uppercase">Tulos</h4>
          </div>

          <AnimatedList>
            {obsAthletes.data?.Rounds.map((r) =>
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
                }).map((a) => (
                  <li
                    key={a.Id}
                    className=" flex flex-wrap justify-between border-t-2 border-black/50"
                  >
                    <div className="flex flex-[1_1_100%] justify-between px-4 py-1">
                      {a.Name}
                      <span>{butterParse(a.Result) >= 0 ? a.Result : ""}</span>
                    </div>
                    <ul
                      className={cn(
                        "ml-1  flex-[1_1_100%] bg-gray-300 text-black",
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
                              a.Result === at.Line1 && "!bg-cyan-300/50",
                              "min-w-[16.7%] px-1 py-2 even:bg-gray-200",
                            )}
                          >
                            {at.Line1}
                          </li>
                        ))
                      )}
                    </ul>
                  </li>
                )),
              ),
            )}
          </AnimatedList>
        </div>
        <h1 className="mt-1 inline-flex bg-black/90 p-1 uppercase text-cyan-300">
          {obsCompetition.data?.Competition.Name}
        </h1>
      </div>
    </>
  );
}
