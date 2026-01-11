import { ClipboardList, Trophy, Users } from "lucide-react";
import {
	CompetitionLayout,
	ParticipantLayout,
	ResultLayout,
} from "~/@/components/competition-layout";
import { EventSwitcher } from "~/@/components/event-switcher";
import { ObsPopover } from "~/@/components/obs-popover";
import { RoundProvider } from "~/@/components/round-provider";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "~/@/components/ui/tabs";
import { api } from "~/trpc/server";

export default async function Comp({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	// console.log("Comp params:", slug);
	const compId = slug?.slice(0, slug.indexOf("-"));
	// console.log("Comp id:", compId);
	const eventId = slug?.slice(slug.indexOf("-") + 1);
	// console.log("Event id:", eventId);
	const compSTD = await api.competition.getCompetitionDetails({
		competitionDetailsId: compId,
	});
	const athletes = await api.competition.getAthletes({
		compId: `${compId}/${eventId}`,
	});
	const compD = await api.competition.getEvents({ compId: Number(compId) });
	// console.log("Comp data:", compD);

	return (
		<RoundProvider rounds={athletes.Rounds}>
			<main className="container relative mx-auto flex grow flex-col p-4 sm:p-8">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-col items-start gap-2">
						<h2 className="scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0">
							{!!compSTD && compSTD.Competition.Name}
						</h2>
						<EventSwitcher
							competitionId={compId}
							currentEventId={eventId}
							events={compD}
						/>
					</div>
					<ObsPopover slug={slug} />
				</div>
				<Tabs className="mt-2 w-full" defaultValue="participants">
					<TabsList className="mb-2 grid h-auto w-full grid-cols-3 bg-transparent p-0">
						<TabsTrigger
							className="rounded-none border-transparent border-b-2 py-3 text-muted-foreground hover:border-primary/70 hover:text-foreground/70 data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
							value="participants"
						>
							<div className="flex items-center justify-center gap-2">
								<span className="flex h-5 w-5 items-center justify-center rounded-full border">
									<Users className="h-3 w-3" />
								</span>
								<span className="hidden sm:block">Ilmoittautuneet</span>
							</div>
						</TabsTrigger>
						<TabsTrigger
							className="rounded-none border-transparent border-b-2 py-3 text-muted-foreground hover:border-primary/70 hover:text-foreground/70 data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
							value="protocol"
						>
							<div className="flex items-center justify-center gap-2">
								<span className="flex h-5 w-5 items-center justify-center rounded-full border">
									<ClipboardList className="h-3 w-3" />
								</span>
								<span className="hidden sm:block">Pöytäkirjat</span>
							</div>
						</TabsTrigger>
						<TabsTrigger
							className="rounded-none border-transparent border-b-2 py-3 text-muted-foreground hover:border-primary/70 hover:text-foreground/70 data-[state=active]:border-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-none"
							value="results"
						>
							<div className="flex items-center justify-center gap-2">
								<span className="flex h-5 w-5 items-center justify-center rounded-full border">
									<Trophy className="h-3 w-3" />
								</span>
								<span className="hidden sm:block">Tulokset</span>
							</div>
						</TabsTrigger>
					</TabsList>
					<TabsContent
						className="fade-in-50 animate-in duration-300"
						value="participants"
					>
						<ParticipantLayout athletes={athletes} />
					</TabsContent>
					<TabsContent
						className="fade-in-50 animate-in duration-300"
						value="protocol"
					>
						<CompetitionLayout />
					</TabsContent>
					<TabsContent
						className="fade-in-50 animate-in space-y-5 duration-300"
						value="results"
					>
						<ResultLayout athletes={athletes} />
					</TabsContent>
				</Tabs>
			</main>
		</RoundProvider>
	);
}
