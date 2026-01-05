"use client";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";
import { useRound } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
import { Skeleton } from "~/@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/@/components/ui/table";
import { cn } from "~/@/lib/utils";
import type { Allocation, Competition, Heat } from "~/types/comp";

type Column<T> = {
	header: React.ReactNode;
	className?: string;
	cell: (row: T) => React.ReactNode;
};

type CompetitionTableProps<T> = {
	data: T[];
	columns: Column<T>[];
	rowClassName?: (row: T) => string;
};

function CompetitionTable<T>({
	data,
	columns,
	rowClassName,
}: CompetitionTableProps<T>) {
	return (
		<Table className="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block">
			<TableHeader className="sticky top-0 backdrop-blur-md">
				<TableRow>
					{columns.map((col, i) => (
						<TableHead key={i} className={col.className}>
							{col.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>

			<TableBody>
				{data.map((row, i) => (
					<TableRow
						key={i}
						className={rowClassName ? rowClassName(row) : undefined}
					>
						{columns.map((col, j) => (
							<TableCell key={j}>{col.cell(row)}</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function MobileList<T>({ data }: { data: T[] }) {
	return (
		<ul className="flex flex-col gap-4 lg:hidden">
			{data.map((a) => (
				<li
					key={a.Id}
					className={cn(
						a.Confirmed ? "bg-green-300/10 hover:bg-green-300/15" : "",
						"rounded-lg border px-4 py-4",
					)}
				>
					<div className="flex items-start justify-between gap-3">
						<div>
							<h3 className="font-semibold text-base">
								{a.Position} {a.Name}
							</h3>
							<p className="text-muted-foreground text-xs">
								{a.Organization?.Name ?? "-"}
							</p>
						</div>
						<div className="flex gap-2 text-xs opacity-70">
							<span>PB {a.PB || "-"}</span>
							<span>SB {a.SB || "-"}</span>
						</div>
					</div>
				</li>
			))}
		</ul>
	);
}

function MobileResultList<T>({ data }: { data: T[] }) {
	return (
		<ul className="flex flex-col gap-4 lg:hidden">
			{data.map((a) => (
				<li
					key={a.Id}
					className={cn(
						a.Confirmed ? "bg-green-300/10 hover:bg-green-300/15" : "",
						"rounded-lg border px-4 py-4",
					)}
				>
					<div className="flex flex-col items-start justify-between gap-2">
						<div className="flex flex-col">
							<div className="flex gap-2">
								<h2 className="font-semibold text-base leading-tight">
									<span className="mr-2 text-muted-foreground">
										#{a.ResultRank}
									</span>
									<span>{a.Name}</span>
								</h2>
								<div className="flex shrink-0 gap-2 text-xs opacity-70">
									<span>PB: {a.PB || "-"}</span>
									<span>SB: {a.SB || "-"}</span>
								</div>
							</div>
							<p className="text-muted-foreground text-xs">
								{a.Organization.Name ?? "-"}
							</p>
						</div>
						{a.Attempts && (
							<ul className="flex flex-wrap gap-2 pt-1">
								{a.Attempts
									? a.Attempts.map((at, index) => (
											<li
												className={cn(
													a.Result === at.Line1 && "bg-neutral-300/50!",
													"-my-1 flex flex-col rounded bg-neutral-600/50 px-2 py-1 text-sm",
												)}
												key={`${at.Line1}-${index}`}
											>
												<span>{at.Line1}</span>
												{at.Line2 && <span>{at.Line2}</span>}
											</li>
										))
									: null}
							</ul>
						)}
					</div>
				</li>
			))}
		</ul>
	);
}

function NameAndOrg({
	name,
	organization,
	number,
}: {
	name: string;
	organization?: { Name: string } | null;
	number?: string | number | null;
}) {
	return (
		<div className="flex flex-col">
			<div className="flex items-center">
				{!!number && (
					<span className="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200">
						{number}
					</span>
				)}
				<span className="font-medium">{name}</span>
			</div>
			<div className="mt-1 text-muted-foreground text-xs">
				{organization?.Name ?? "-"}
			</div>
		</div>
	);
}

function HeatSelector({
	heats,
	selectedHeat,
	handleHeatChange,
}: {
	heats: Heat[];
	selectedHeat: number;
	handleHeatChange: (heat: number) => void;
}) {
	return (
		<div className="mb-4 flex flex-wrap gap-2">
			<div className="mb-2 w-full text-muted-foreground text-sm">
				Valiste erä:
			</div>
			{heats.map((heat) => (
				<Button
					key={heat.Index}
					onClick={() => handleHeatChange(heat.Index)}
					variant={selectedHeat === heat.Index ? "default" : "outline"}
				>
					Erä {heat.Index}
				</Button>
			))}
		</div>
	);
}

export function ParticipantLayout({ athletes }: { athletes: Competition }) {
	return (
		<>
			{/* biome-ignore assist/source/useSortedAttributes: no */}
			<CompetitionTable
				data={athletes.Enrollments}
				columns={[
					{
						header: "Varm.",
						cell: (p) =>
							p.Confirmed ? (
								<div className="flex h-5 w-5 items-center justify-center">
									<CheckCircle className="h-3 w-3 text-white" />
								</div>
							) : null,
					},
					{
						header: "Nimi ja Seura",
						className: "w-full",
						cell: (p) => (
							<NameAndOrg
								name={p.Name}
								organization={p.Organization}
								number={p.Number}
							/>
						),
					},
					{
						header: "PB",
						cell: (p) => <span className="font-medium">{p.PB || "-"}</span>,
					},
					{
						header: "SB",
						cell: (p) => <span className="font-medium">{p.SB || "-"}</span>,
					},
				]}
				rowClassName={(p) =>
					p.Confirmed ? "bg-green-300/10 hover:bg-green-300/15" : ""
				}
			/>
			<MobileList data={athletes.Enrollments} />
		</>
	);
}

// TODO: maybe combine this with the participant and protocol look at mockup that the
// layout will stay the same on both componnent but the data will be different but result
// is different as it show heat result and the end result
export function CompetitionLayout() {
	const {
		currentHeat,
		selectedHeat,
		heats,
		showHeatNumbers,
		handleHeatChange,
	} = useRound();

	if (heats.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">
					Eräjakoja ei ole saatavilla vielä.
				</p>
			</div>
		);
	}

	return (
		<>
			{heats.length > 0 && (
				<div className="space-y-6">
					{/* Heat Selection Tabs - Only show when there are multiple heats */}
					{showHeatNumbers && heats.length > 1 && (
						<HeatSelector
							heats={heats}
							selectedHeat={selectedHeat}
							handleHeatChange={handleHeatChange}
						/>
					)}
					{/** biome-ignore assist/source/useSortedAttributes: <explanation> */}
					<CompetitionTable
						// biome-ignore lint/style/noNonNullAssertion: fix it later
						data={currentHeat!.Allocations}
						columns={[
							{
								header: "Rata/Järj",
								className: "w-[100px]",
								cell: (a) => <span>{a.Number}</span>,
							},
							{
								header: "Nimi ja Seura",
								className: "w-full",
								cell: (a) => (
									<NameAndOrg
										name={a.Name}
										organization={a.Organization}
										number={a.Number}
									/>
								),
							},
							{
								header: "PB",
								cell: (a) => <span className="font-medium">{a.PB || "-"}</span>,
							},
							{
								header: "SB",
								cell: (a) => <span className="font-medium">{a.SB || "-"}</span>,
							},
						]}
					/>

					<MobileList data={currentHeat!.Allocations} />
				</div>
			)}
		</>
	);
}

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

function sortByResult(a: Allocation, b: Allocation) {
	if (butterParse(a.Result) === null || butterParse(b.Result) === null) {
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
}

export function ResultLayout({ athletes }: { athletes: Competition }) {
	const {
		currentHeat,
		selectedHeat,
		heats,
		showHeatNumbers,
		handleHeatChange,
	} = useRound();

	if (heats.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">
					Eräjakoja ei ole saatavilla vielä.
				</p>
			</div>
		);
	}

	return (
		<>
			{heats.length > 0 && (
				<div className="space-y-6">
					{/* Heat Selection Tabs - Only show when there are multiple heats */}
					{showHeatNumbers && heats.length > 1 && (
						<HeatSelector
							heats={heats}
							selectedHeat={selectedHeat}
							handleHeatChange={handleHeatChange}
						/>
					)}
					<CompetitionTable
						data={currentHeat!.Allocations.sort(sortByResult)}
						columns={[
							{
								header: "Sija",
								className: "w-[100px]",
								cell: (a) => <span>{a.Position}</span>,
							},
							{
								header: "Nimi ja Seura",
								className: "w-full",
								cell: (a) => (
									<NameAndOrg
										name={a.Name}
										organization={a.Organization}
										number={a.Number}
									/>
								),
							},
							{
								header: "Tulos",
								cell: (a) => (
									<ul className="flex gap-2">
										<Suspense fallback={<Skeleton />}>
											{a.Attempts
												? a.Attempts.map((at, index) => (
														<li
															className={cn(
																a.Result === at.Line1 && "bg-neutral-300/50!",
																"-my-1 flex flex-col rounded bg-neutral-600/50 px-2 py-1 text-sm",
															)}
															key={`${at.Line1}-${index}`}
														>
															<span>{at.Line1}</span>
															{at.Line2 && <span>{at.Line2}</span>}
														</li>
													))
												: null}
										</Suspense>
									</ul>
								),
							},
						]}
					/>
					{athletes.RoundCount > 2 && (
						<>
							<h3 className="scroll-m-20 font-semibold text-2xl tracking-tight">
								Kokonaistulokset
							</h3>
							<CompetitionTable
								data={athletes.Rounds.map((round) =>
									round.TotalResults.sort(sortByResult),
								)}
								columns={[
									{
										header: "Sija",
										className: "w-[100px]",
										cell: (a) => <span>{a.ResultRank}</span>,
									},
									{
										header: "Nimi ja Seura",
										className: "w-full",
										cell: (a) => (
											<NameAndOrg
												name={a.Name}
												organization={a.Organization}
												number={a.Number}
											/>
										),
									},
									{
										header: "Tulos",
										cell: (a) => (
											<ul className="flex gap-2">
												<Suspense fallback={<Skeleton />}>
													{a.Attempts
														? a.Attempts.map((at, index) => (
																<li
																	className={cn(
																		allocation.Result === at.Line1 &&
																			"bg-neutral-300/50!",
																		"-my-1 flex flex-col rounded bg-neutral-600/50 px-2 py-1 text-sm",
																	)}
																	key={`${at.Line1}-${index}`}
																>
																	<span>{at.Line1}</span>
																	{at.Line2 && <span>{at.Line2}</span>}
																</li>
															))
														: null}
												</Suspense>
											</ul>
										),
									},
								]}
							/>
						</>
					)}
					<MobileResultList
						data={currentHeat!.Allocations.sort(sortByResult)}
					/>
				</div>
			)}
		</>
	);
}
