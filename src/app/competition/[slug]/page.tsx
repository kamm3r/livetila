import {
	CheckCircle,
	ClipboardList,
	InfoIcon,
	Loader2Icon,
	Trophy,
	Users,
} from "lucide-react";
import { Suspense } from "react";
import {
	CompetitionLayout,
	ResultLayout,
} from "~/@/components/competition-layout";
import { Embed } from "~/@/components/embed";
import { Navbar } from "~/@/components/navbar";
import { RoundProvider } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/@/components/ui/popover";
import { Separator } from "~/@/components/ui/separator";
import { Skeleton } from "~/@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/@/components/ui/table";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "~/@/components/ui/tabs";
import { cn } from "~/@/lib/utils";
import { api } from "~/trpc/server";

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
	console.log("Comp params:", slug);
	const compId = slug?.replace("-", "/");
	const athletes = await api.competition.getAthletes({ compId });

	return (
		<RoundProvider rounds={athletes.Rounds}>
			<Navbar />
			<main className="container relative mx-auto flex grow flex-col p-4 sm:p-8">
				<ObsPopover slug={slug} />
				<Tabs className="mt-2 w-full" defaultValue="participants">
					<TabsList className="grid h-auto w-full grid-cols-3 bg-transparent p-0">
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
						<Table className="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block">
							<TableHeader className="sticky top-0 backdrop-blur-md">
								<TableRow>
									<TableHead>Varm.</TableHead>
									<TableHead className="w-full">Nimi ja Seura</TableHead>
									<TableHead>PB</TableHead>
									<TableHead>SB</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<Suspense>
									{athletes.Enrollments.map((participant) => (
										<TableRow
											className={
												participant.Confirmed
													? "bg-green-300/10 hover:bg-green-300/15"
													: ""
											}
											key={participant.Id}
										>
											<Suspense>
												<TableCell>
													{participant.Confirmed ? (
														<div className="flex h-5 w-5 items-center justify-center">
															<CheckCircle className="h-3 w-3 text-white" />
														</div>
													) : null}
												</TableCell>
												<TableCell>
													<div className="flex flex-col">
														<div className="flex items-center">
															{!!participant.Number && (
																<span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200">
																	{participant.Number}
																</span>
															)}
															<span className="font-medium">
																{participant.Name}
															</span>
														</div>
														<div className="mt-1 text-muted-foreground text-xs">
															{participant.Organization
																? participant.Organization.Name
																: "-"}
														</div>
													</div>
												</TableCell>

												<TableCell>
													<span className="font-medium">
														{participant.PB || "-"}
													</span>
												</TableCell>
												<TableCell>
													<span className="font-medium">
														{participant.SB || "-"}
													</span>
												</TableCell>
											</Suspense>
										</TableRow>
									))}
								</Suspense>
							</TableBody>
						</Table>
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
						<ResultLayout />

						<h3 className="scroll-m-20 font-semibold text-2xl tracking-tight">
							Kokonaistulokset
						</h3>
						<Table className="relative hidden rounded-md border md:block">
							<TableHeader className="sticky top-0 backdrop-blur-md">
								<TableRow>
									<TableHead className="w-[100px]">Sija</TableHead>
									<TableHead className="w-full">Nimi ja Seura</TableHead>
									<TableHead className="w-full">Tulos</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="overflow-y-auto">
								<Suspense>
									{athletes.Rounds.map((r) =>
										r.TotalResults.sort((a, b) => {
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
												return butterParse(a.Result) > butterParse(b.Result)
													? -1
													: 1;
											}
										}).map((allocation) => (
											<TableRow className="" key={allocation.Id}>
												<Suspense>
													<TableCell>{allocation.ResultRank}</TableCell>
													<TableCell>
														<div className="flex flex-col">
															<div className="flex items-center">
																{!!allocation.Number && (
																	<span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200">
																		{allocation.Number}
																	</span>
																)}
																<span className="font-medium">
																	{allocation.Name}
																</span>
															</div>
															<div className="mt-1 text-muted-foreground text-xs">
																{allocation.Organization
																	? allocation.Organization.Name
																	: "-"}
															</div>
														</div>
													</TableCell>
													<TableCell>
														<ul className="flex gap-2">
															<Suspense fallback={<Skeleton />}>
																{allocation.Attempts
																	? allocation.Attempts.map((at) => (
																			<li
																				className={cn(
																					allocation.Result === at.Line1 &&
																						"bg-neutral-300/50!",
																					"-my-1 flex flex-col rounded bg-neutral-600/50 px-2 py-1 text-sm",
																				)}
																				key={at.Line1}
																			>
																				<span>{at.Line1}</span>
																				{at.Line2 && <span>{at.Line2}</span>}
																			</li>
																		))
																	: null}
															</Suspense>
														</ul>
													</TableCell>
												</Suspense>
											</TableRow>
										)),
									)}
								</Suspense>
							</TableBody>
						</Table>
					</TabsContent>
				</Tabs>
				<div>
					<ul className="flex flex-col gap-3 md:hidden">
						<Suspense fallback={<Loader2Icon className="animate-spin" />}>
							{athletes.Rounds.map((r) =>
								r.TotalResults.sort((a, b) => {
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
										return butterParse(a.Result) > butterParse(b.Result)
											? -1
											: 1;
									}
								}).map((a) => (
									<li
										className="flex w-full max-w-[400px] flex-col gap-1 rounded border px-4 py-3"
										key={a.Id}
									>
										<Suspense>
											<h2 className="font-semibold text-2xl leading-none tracking-tight">
												<span>{a.ResultRank}</span> <span>{a.Name}</span>
											</h2>
											<span className="text-xs opacity-70">
												PB: {a.PB} SB: {a.SB}
											</span>
											<p className="pb-2 text-muted-foreground text-sm">
												{a.Organization.Name}
											</p>
											<ul className="flex gap-2">
												<Suspense fallback={<Skeleton />}>
													{a.Attempts
														? a.Attempts.map((at) => (
																<li
																	className="-my-1 flex flex-col rounded bg-muted px-2 py-1 text-sm dark:bg-neutral-600/50"
																	key={at.Line1}
																>
																	<span>{at.Line1}</span>
																	{at.Line2 && <span>{at.Line2}</span>}
																</li>
															))
														: null}
												</Suspense>
											</ul>
										</Suspense>
									</li>
								)),
							)}
						</Suspense>
					</ul>
				</div>
			</main>
		</RoundProvider>
	);
}
