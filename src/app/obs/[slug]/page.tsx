import { cn } from "~/@/lib/utils";
import { AnimatedList } from "~/app/_components/animated-list";
import { api } from "~/trpc/server";

function butterParse(a: string): number {
  if (a === "NM" || Number.isNaN(a)) {
    return 0;
  } else {
    return parseFloat(a);
  }
}

export default async function Obs({ params }: { params: { slug: string } }) {
  const compId = params.slug.replace("-", "/");
  const obsAthletes = await api.competition.getAthletes({ compId });

  return (
    <>
      <div className="max-w-xs text-gray-50">
        <div className="w-full max-w-xs border-t-2 border-cyan-300 bg-black/90">
          <h2 className="px-2 uppercase text-cyan-300">
            {obsAthletes.Rounds[0]?.Name}
          </h2>
          <div className="flex justify-between">
            <h3 className="bg-cyan-300 px-2 uppercase text-black">
              {obsAthletes.Name}
            </h3>
            <h4 className="px-2 uppercase">Tulos</h4>
          </div>

          <AnimatedList>
            {obsAthletes.Rounds.map((r) =>
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
                      {a.Attempts === null
                        ? "no  mans"
                        : a.Attempts?.map((at, idx) => (
                            <li
                              key={idx}
                              className={cn(
                                a.Result === at.Line1 && "!bg-cyan-300/50",
                                "min-w-[16.7%] px-1 py-2 even:bg-gray-200",
                              )}
                            >
                              {at.Line1}
                            </li>
                          ))}
                    </ul>
                  </li>
                )),
              ),
            )}
          </AnimatedList>
        </div>
        <h1 className="mt-1 inline-flex bg-black/90 p-1 uppercase text-cyan-300">
          Tour de Hammer
        </h1>
      </div>
    </>
  );
}
