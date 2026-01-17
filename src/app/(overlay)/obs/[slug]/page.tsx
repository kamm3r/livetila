"use client";

import { Loader2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useState } from "react";
import { AnimatedList } from "~/@/components/animated-list";
import { sortByResult } from "~/@/lib/results";
import { cn } from "~/@/lib/utils";
import { api } from "~/trpc/react";
import type { Competition } from "~/types/comp";

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
	const [lastUpdate, setLastUpdate] = useState(0);
	const [liveData, setLiveData] = useState<Competition | null>(null);
	const compId = slug?.slice(0, slug.indexOf("-"));
	const eventId = slug?.slice(slug.indexOf("-") + 1);
	const obsAthletes = api.competition.getAthletes.useQuery({
		compId: `${compId}/${eventId}`,
	});
	const obsCompetition = api.competition.getCompetitionDetails.useQuery({
		competitionDetailsId: compId,
	});
	const obsEvents = api.competition.getEvents.useQuery({
		compId: compId,
	});

	// Subscribe to real-time updates
	api.competition.onResultsUpdate.useSubscription(
		{ compId, eventId },
		{
			enabled: !!compId && !!eventId,
			onData: (data) => {
				console.log("[CLIENT] Received update:", data);
				setLiveData(data);
				setLastUpdate(Date.now());
			},
			onError: (err) => {
				console.error("[CLIENT] Subscription error:", err);
			},
		},
	);

	const selectedEvent = Object.values(obsEvents.data || {})
		.flat()
		.find((event) => event.EventId === Number(eventId));

	const isTrack = selectedEvent?.Category === "Track";

	const searchParams = useSearchParams();
	const selectedHeat = searchParams.get("heat");
	const athleteData = liveData ?? obsAthletes.data;
	const filteredHeats = athleteData?.Rounds?.[0]?.Heats.filter(
		(_heat, index) => {
			if (selectedHeat) {
				return index + 1 === parseInt(selectedHeat, 10); // Show only selected heat
			}
			return true; // Show all heats if no heat is selected
		},
	);

	const allocations = filteredHeats?.flatMap((h) =>
		h.Allocations.sort(sortByResult),
	);

	return (
		<Suspense fallback={<Loader2Icon className="animate-spin" />}>
			<div className="max-w-xs text-gray-50">
				<div className="w-full max-w-xs border-cyan-300 border-t-2 bg-black/90">
					<h2 className="px-2 text-cyan-300 uppercase">
						{athleteData?.Rounds[0]?.Name}
					</h2>
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
											<p className="opacity-0">no</p>
										) : (
											normalizeAttempts(a.Attempts)?.map((at, index) => (
												<li
													className={cn(
														a.Result === at.Line1 && "bg-cyan-300/50!",
														"flex min-w-[16.7%] flex-col px-1 py-2 even:bg-gray-200",
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
			{lastUpdate > 0 && (
				<div className="px-2 text-blue-300 text-xl">
					Last update: {new Date(lastUpdate).toLocaleTimeString()}
				</div>
			)}
		</Suspense>
	);
}
