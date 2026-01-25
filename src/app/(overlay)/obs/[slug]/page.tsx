"use client";

import { Loader2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, use } from "react";
import { AnimatedList } from "~/@/components/animated-list";
import { sortByResult } from "~/@/lib/results";
import { cn } from "~/@/lib/utils";
import { api } from "~/trpc/react";

type Attempt = {
  Line1: string;
  Line2?: string;
};

const MAX_ATTEMPTS = 6;

function normalizeAttempts(attempts: Attempt[] | null | undefined): Attempt[] {
  if (!attempts || attempts.length <= MAX_ATTEMPTS) {
    return attempts ?? [];
  }

  // Always keep most recent attempts
  return attempts.slice(-MAX_ATTEMPTS);
}

export default function Obs({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const compId = slug?.slice(0, slug.indexOf("-"));
  const eventId = slug?.slice(slug.indexOf("-") + 1);
  const obsEvents = api.competition.getEvents.useQuery({
    compId: compId,
  });

  const selectedEvent = Object.values(obsEvents.data || {})
    .flat()
    .find((event) => event.EventId === Number(eventId));

  const obsAthletes = api.competition.getAthletes.useQuery(
    {
      compId: `${compId}/${eventId}`,
    },
    {
      refetchInterval: selectedEvent?.Status === "Progress" ? 1000 : false,
      refetchIntervalInBackground: false,
      staleTime: selectedEvent?.Status === "Progress" ? 0 : 30_000,
    },
  );
  const obsCompetition = api.competition.getCompetitionDetails.useQuery({
    competitionDetailsId: compId,
  });
  const eventCategory = selectedEvent?.Category;
  const isTrack = eventCategory === "Track";

  const searchParams = useSearchParams();
  const selectedHeat = searchParams.get("heat");
  const selectedRound = searchParams.get("round");
  const athleteData = obsAthletes.data;
  const roundIndex = selectedRound ? Number.parseInt(selectedRound, 10) - 1 : 0;
  const rounds = athleteData?.Rounds[roundIndex];
  const heats = rounds?.Heats ?? [];
  const selectedHeatIndex = selectedHeat
    ? Number.parseInt(selectedHeat, 10) - 1
    : null;

  const heatExists =
    selectedHeatIndex !== null &&
    selectedHeatIndex >= 0 &&
    selectedHeatIndex < heats.length;

  const activeHeats =
    selectedHeatIndex === null
      ? heats
      : heatExists
        ? [heats[selectedHeatIndex]]
        : [];

  const allocations = !selectedHeat
    ? rounds?.TotalResults.slice().sort((a, b) =>
        sortByResult(a, b, eventCategory || "Field"),
      )
    : activeHeats
        ?.flatMap((h) => h?.Allocations ?? [])
        .slice()
        .sort((a, b) => sortByResult(a, b, eventCategory || "Field"));

  return (
    <Suspense fallback={<Loader2Icon className="animate-spin" />}>
      {!rounds && (
        <p className="px-2 py-1 text-yellow-600 text-xl">Round not available</p>
      )}

      {rounds && selectedHeat && !heatExists && (
        <p className="px-2 py-1 text-yellow-600 text-xl">
          Heat {selectedHeat} does not exist
        </p>
      )}
      <div className="max-w-xs text-gray-50">
        <div className="w-full max-w-xs border-cyan-300 border-t-2 bg-black/90">
          <h2 className="px-2 text-cyan-300 uppercase">{rounds?.Name}</h2>
          <div className="flex justify-between">
            <h3 className="bg-cyan-300 px-2 text-black uppercase">
              {athleteData?.Name}
            </h3>
            <h4 className="px-2 uppercase">Tulos</h4>
          </div>
          <AnimatedList>
            {allocations?.map((a) => (
              <li
                className="flex flex-wrap justify-between border-black/50 border-t-2"
                key={a.Id}
              >
                <div className="flex flex-[1_1_100%] justify-between px-4 py-1">
                  {a.Name}
                  <span className="tabular-nums">{a.Result}</span>
                </div>
                {!isTrack && (
                  <ul
                    className={cn(
                      "ml-1 flex-[1_1_100%] bg-gray-300 text-black",
                      a.Id ? "flex" : "hidden",
                    )}
                  >
                    {a.Attempts === null ? (
                      <p aria-hidden className="invisible">
                        no
                      </p>
                    ) : (
                      normalizeAttempts(a.Attempts)?.map((at, index) => (
                        <li
                          className={cn(
                            "flex min-w-[16.7%] flex-col px-1 py-2 even:bg-gray-200",
                            a.Result === at.Line1 && "bg-cyan-300/50!",
                          )}
                          key={`${at.Line1}-${index}`}
                        >
                          <span>{at.Line1}</span>
                          {at.Line2 && <span>{at.Line2}</span>}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </li>
            ))}
          </AnimatedList>
        </div>
        <h1 className="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">
          {obsCompetition.data?.Competition.Name}
        </h1>
      </div>
    </Suspense>
  );
}
