"use client";
import { Loader2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AnimatedList } from "~/@/components/animated-list";
import { cn } from "~/@/lib/utils";
import { api } from "~/trpc/react";

function butterParse(a: string): number {
	if (a === "NM" || Number.isNaN(a)) {
		return 0;
	} else if (a === null) {
		return 0;
	} else if (a === "DNS" || a === "DQ" || a === "DNF" || a === "DSQ") {
		return -1;
	} else {
		return parseFloat(a);
	}
}

export default function Obs({ params }: { params: { slug: string } }) {
	const compId = params.slug?.replace("-", "/");
	const competitionDetailsId = params.slug?.split("-")[0] || "";
	const obsAthletes = api.competition.getAthletes.useQuery(
		{ compId },
		{ refetchInterval: 1000 },
	);
	const obsCompetition = api.competition.getCompetitionDetails.useQuery({
		competitionDetailsId: competitionDetailsId,
	});

	const searchParams = useSearchParams();
	const selectedHeat = searchParams.get("heat");

	const filteredHeats = obsAthletes.data?.Rounds[0]?.Heats.filter(
		(_heat, index) => {
			if (selectedHeat) {
				return index + 1 === parseInt(selectedHeat, 10); // Show only selected heat
			}
			return true; // Show all heats if no heat is selected
		},
	);
	return (
		<Suspense fallback={<Loader2Icon className="animate-spin" />}>
			<div className="max-w-xs text-gray-50">
				<div className="w-full max-w-xs border-cyan-300 border-t-2 bg-black/90">
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
						{filteredHeats?.map((h) => {
							// console.log("heats", r.Heats);
							return h.Allocations.sort((a, b) => {
								if (
									butterParse(a.Result) === null ||
									butterParse(b.Result) === null
								) {
									return -1;
								} else if (butterParse(a.Result) === -1) {
									return 1;
								} else if (butterParse(b.Result) === -1) {
									return -1;
								} else if (butterParse(a.Result) === 0) {
									return 1;
								} else if (butterParse(b.Result) === 0) {
									return -1;
								} else {
									return butterParse(a.Result) > butterParse(b.Result) ? -1 : 1;
								}
							}).map((a) => (
								<li
									className="flex flex-wrap justify-between border-black/50 border-t-2"
									key={a.Id}
								>
									<div className="flex flex-[1_1_100%] justify-between px-4 py-1">
										{a.Name}
										<span>{butterParse(a.Result) >= 0 ? a.Result : ""}</span>
									</div>
									<ul
										className={cn(
											"ml-1 flex-[1_1_100%] bg-gray-300 text-black",
											a.Id ? "flex" : "hidden",
										)}
									>
										{a.Attempts === null ? (
											<p className="opacity-0">no</p>
										) : (
											a.Attempts?.map((at, index) => (
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
								</li>
							));
						})}
					</AnimatedList>
				</div>
				<h1 className="mt-1 inline-flex bg-black/90 p-1 text-cyan-300 uppercase">
					{obsCompetition.data?.Competition.Name}
				</h1>
			</div>
		</Suspense>
	);
}
