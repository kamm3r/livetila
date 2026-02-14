"use client";

import { useSearchParams } from "next/navigation";
import { use } from "react";
import { AnimatedList } from "~/@/components/animated-list";
import { Skeleton } from "~/@/components/ui/skeleton";
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
	return attempts.slice(-MAX_ATTEMPTS);
}

function AllocationsSkeleton({ rows = 8 }: { rows?: number }) {
	return (
		<ul>
			{Array.from({ length: rows }).map((_, i) => (
				<li className="border-black/50 border-t-2" key={i}>
					<div className="flex flex-[1_1_100%] justify-between px-4 py-2">
						<Skeleton className="h-4 w-40 bg-gray-700/60" />
						<Skeleton className="h-4 w-16 bg-gray-700/60" />
					</div>
				</li>
			))}
		</ul>
	);
}

export default function Obs({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = use(params);
	const [compId, eventId] = slug.split("-", 2);
	const searchParams = useSearchParams();
	const selectedHeat = searchParams.get("heat");
	const selectedRound = searchParams.get("round");
	const obsEvents = api.competition.getEvents.useQuery(
		{
			compId: compId || "",
		},
		{
			refetchInterval: (q) => {
				const selected = Object.values(q.state.data ?? {})
					.flat()
					.find((e) => e.EventId === Number(eventId));

				return selected?.Status === "Progress" ? 1000 : 30_000;
			},
			refetchIntervalInBackground: false,
		},
	);
	const obsCompetition = api.competition.getCompetitionDetails.useQuery({
		competitionDetailsId: compId || "",
	});

	const selectedEvent = Object.values(obsEvents.data || {})
		.flat()
		.find((event) => event.EventId === Number(eventId));

	const obsAthletes = api.competition.getAthletes.useQuery(
		{
			compId: `${compId}/${eventId}`,
		},
		{
			enabled: !!compId && !!eventId,
			refetchInterval: selectedEvent?.Status === "Progress" ? 1000 : false,
			refetchIntervalInBackground: false,
			staleTime: selectedEvent?.Status === "Progress" ? 0 : 30_000,
		},
	);

	const eventCategory = selectedEvent?.Category;
	const isTrack = eventCategory === "Track" || eventCategory === "Relay";
	const athleteData = obsAthletes.data;

	const roundIndex = (Number(selectedRound) || 1) - 1;
	const rounds = athleteData?.Rounds?.[roundIndex];

	const heats = rounds?.Heats ?? [];

	const heatIndexRaw = selectedHeat ? Number(selectedHeat) - 1 : null;
	const heatIndex =
		heatIndexRaw != null && Number.isInteger(heatIndexRaw)
			? heatIndexRaw
			: null;

	const heatExists =
		heatIndex != null && heatIndex >= 0 && heatIndex < heats.length;

	const heat = heatExists ? heats[heatIndex] : null;

	const category = eventCategory ?? "Field";

	const allocations = (
		selectedHeat ? (heat?.Allocations ?? []) : (rounds?.TotalResults ?? [])
	)
		.slice()
		.sort((a, b) => sortByResult(a, b, category));

	if (rounds && selectedHeat && !heatExists) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="max-w-md rounded-lg bg-black/90 p-6 text-center">
					<p className="text-cyan-300 text-xl">
						Erä {selectedHeat} ei ole olemassa
					</p>
					<p className="mt-2 text-gray-400 text-sm">
						Tämä tapahtuma sisältää {heats.length} erää.
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="max-w-xs text-gray-50">
				<div className="w-full max-w-xs border-cyan-300 border-t-2 bg-black/90">
					<h2 className="px-2 text-cyan-300 uppercase">
						{rounds?.Name ?? (
							<Skeleton className="my-1 h-4 w-28 bg-gray-700/60" />
						)}
					</h2>
					<div className="flex justify-between">
						<h3 className="bg-cyan-300 px-2 text-black uppercase">
							{athleteData?.Name ?? (
								<Skeleton className="my-1 h-4 w-24 bg-black/20" />
							)}
						</h3>
						<h4 className="px-2 uppercase">Tulos</h4>
					</div>
					{obsAthletes.isError ? (
						<p className="px-2 py-1 text-cyan-600 text-xl">Failed to load</p>
					) : obsAthletes.isLoading ? (
						<AllocationsSkeleton rows={8} />
					) : !obsAthletes.isLoading && !obsAthletes.isError && !rounds ? (
						<p className="px-2 py-1 text-cyan-600 text-xl">
							Kierros ei saatavilla
						</p>
					) : (
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
										<ul className="ml-1 flex flex-[1_1_100%] bg-gray-300 text-black">
											{a.Attempts === null ? (
												<li aria-hidden className="invisible">
													no
												</li>
											) : (
												normalizeAttempts(a.Attempts)?.map((at, index) => (
													<li
														className={cn(
															"flex min-w-[16.7%] flex-col items-center justify-center px-1 py-2 even:bg-gray-200",
															a.Result === at.Line1 && "bg-cyan-300/50!",
														)}
														key={`${a.Id}-${index}`}
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
					)}
				</div>
				<h1 className="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">
					{obsCompetition.data?.Competition.Name ?? (
						<Skeleton className="my-1 h-4 w-24 bg-gray-700/60" />
					)}
				</h1>
			</div>
		</>
	);
}
