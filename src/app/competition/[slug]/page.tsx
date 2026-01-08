import { ClipboardList, InfoIcon, Trophy, Users } from "lucide-react";
import {
	CompetitionLayout,
	ParticipantLayout,
	ResultLayout,
} from "~/@/components/competition-layout";
import { Embed } from "~/@/components/embed";
import { EventSwitcher } from "~/@/components/event-switcher";
import { Navbar } from "~/@/components/navbar";
import { RoundProvider } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/@/components/ui/popover";
import { Separator } from "~/@/components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "~/@/components/ui/tabs";
import { api } from "~/trpc/server";

// TODO: make the popover link not be hardcoded
function ObsPopover({ slug }: { slug: string }) {
	return (
		<Popover>
			<PopoverTrigger className="top-9 right-5 z-50">
				<Button className="px-2" size="icon" variant="ghost">
					<InfoIcon />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96">
				<div className="flex flex-col gap-4">
					<div className="space-y-2">
						<h4 className="font-medium leading-none">OBS Overlay</h4>
						<p className="text-muted-foreground text-sm">
							jos haluut näyttää vain tietyn erän tulokset niin tee näin
						</p>
						<Separator className="" />
						<div className="break-all rounded-lg border bg-popover-foreground/10 p-3 pr-12 font-mono text-gray-300 text-sm">
							https://livetila.vercel.app/obs/{slug}
							<span className="rounded bg-cyan-300/40 px-1 py-0.5 text-white">
								?heat=1
							</span>
						</div>
					</div>
					<div className="flex gap-4">
						<Embed slug={slug} />
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

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
			<Navbar />
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
