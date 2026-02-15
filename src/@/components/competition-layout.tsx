"use client";
import { CheckCircle } from "lucide-react";
import type React from "react";
import { createContext, type ReactNode, use } from "react";
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
import { sortByResult } from "~/@/lib/results";
import { cn } from "~/@/lib/utils";
import { api } from "~/trpc/react";
import type { Allocation, Enrollment, TotalResult } from "~/types/comp";

type Column<T> = {
	header: React.ReactNode;
	className?: string;
	cell: (row: T) => React.ReactNode;
};

type BaseTableProps<T> = {
	data: T[];
	columns: Column<T>[];
	rowClassName?: (row: T) => string;
};

type AthleteRow = Enrollment | Allocation | TotalResult;

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

function HeatSelector({ children }: { children: React.ReactNode }) {
	const { state, actions, meta } = useRound();
	return (
		<div className="space-y-6">
			{meta.showHeatNumbers && (
				<div className="mb-4 flex flex-wrap gap-2">
					<div className="mb-2 w-full text-muted-foreground text-sm">
						Valitse erä:
					</div>
					{state.heats
						.sort((a, b) => a.Index - b.Index)
						.map((heat) => (
							<Button
								className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								key={heat.Index}
								onClick={() => actions.handleHeatChange(heat.Index)}
								variant={
									state.selectedHeat === heat.Index ? "default" : "outline"
								}
							>
								Erä {heat.Index}
							</Button>
						))}
				</div>
			)}
			{children}
		</div>
	);
}

function AttemptsList({
	attempts,
	bestResult,
}: {
	attempts: Array<{ Line1: string; Line2?: string }> | undefined;
	bestResult?: string | null;
}) {
	if (!attempts) return null;

	return (
		<ul className="flex gap-2">
			{attempts.map((attempt, index) => (
				<li
					className={cn(
						"-my-1 flex flex-col rounded bg-muted-foreground/20 px-2 py-1 text-sm",
						bestResult === attempt.Line1 &&
							"border-primary/20! bg-primary/10! text-primary",
					)}
					key={`${attempt.Line1}-${index}`}
				>
					<span>{attempt.Line1}</span>
					{attempt.Line2 && <span>{attempt.Line2}</span>}
				</li>
			))}
		</ul>
	);
}

function BaseTable<T extends { Id: string | number }>({
	data,
	columns,
	rowClassName,
}: BaseTableProps<T>) {
	return (
		<Table className="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block">
			<TableHeader className="sticky top-0 backdrop-blur-md">
				<TableRow>
					{columns.map((col, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: fix later
						<TableHead className={col.className} key={i}>
							{col.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>

			<TableBody>
				{data.map((row, i) => (
					<TableRow
						className={rowClassName ? rowClassName(row) : undefined}
						key={`${row.Id}-${i}`}
					>
						{columns.map((col, j) => (
							<TableCell key={`${row.Id}-${i}-${j}`}>{col.cell(row)}</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function BaseMobileCard({
	highlight,
	title,
	subtitle,
	meta,
}: {
	highlight?: boolean;
	title: React.ReactNode;
	subtitle?: string;
	meta?: React.ReactNode; //TODO: better name
}) {
	return (
		<li
			className={cn(
				"rounded-lg border px-4 py-4",
				highlight && "bg-green-300/10",
			)}
		>
			<div className="flex flex-col gap-2">
				<div>
					<h3 className="font-semibold text-base">{title}</h3>
					<p className="text-muted-foreground text-xs">{subtitle ?? "-"}</p>
				</div>
				{meta}
			</div>
		</li>
	);
}

function PersonalBestsMeta({
	pb,
	sb,
}: {
	pb?: string | null;
	sb?: string | null;
}) {
	return (
		<div className="flex gap-3 text-xs opacity-70">
			<span>PB {pb || "-"}</span>
			<span>SB {sb || "-"}</span>
		</div>
	);
}

interface MobileListProps<T extends AthleteRow> {
	data: T[];
	getTitle: (item: T) => React.ReactNode;
	renderMeta?: (item: T) => React.ReactNode;
	isHighlighted?: (item: T) => boolean;
}

function MobileList<T extends AthleteRow>({
	data,
	getTitle,
	renderMeta,
	isHighlighted,
}: MobileListProps<T>) {
	return (
		<ul className="flex flex-col gap-4 lg:hidden">
			{data.map((item) => (
				<BaseMobileCard
					highlight={isHighlighted?.(item)}
					key={item.Id}
					meta={renderMeta?.(item)}
					subtitle={item.Organization?.Name}
					title={getTitle(item)}
				/>
			))}
		</ul>
	);
}

const nameAndOrgColumn = <T extends AthleteRow>(
	showNumber = false,
): Column<T> => ({
	header: "Nimi ja Seura",
	className: "w-full",
	cell: (row) => (
		<NameAndOrg
			name={row.Name}
			number={showNumber && "Number" in row ? row.Number : undefined}
			organization={row.Organization}
		/>
	),
});

const pbColumn = <T extends { PB?: string | null }>(): Column<T> => ({
	header: "PB",
	cell: (row) => <span className="font-medium">{row.PB || "-"}</span>,
});

const sbColumn = <T extends { SB?: string | null }>(): Column<T> => ({
	header: "SB",
	cell: (row) => <span className="font-medium">{row.SB || "-"}</span>,
});

const skeletonData = Array.from({ length: 6 }, (_, i) => ({ Id: i }));

const skeletonColumns: Column<{ Id: number }>[] = [
	{
		header: <Skeleton className="h-4 w-6" />,
		className: "w-[100px]",
		cell: () => <Skeleton className="h-4 w-6" />,
	},
	{
		header: <Skeleton className="h-4 w-32" />,
		className: "w-full",
		cell: () => (
			<div className="flex flex-col gap-1">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-3 w-24" />
			</div>
		),
	},
	{
		header: <Skeleton className="ml-auto h-4 w-12" />,
		cell: () => <Skeleton className="ml-auto h-4 w-12" />,
	},
];

function LoadingState() {
	return (
		<>
			<BaseTable columns={skeletonColumns} data={skeletonData} />
			<ul className="flex flex-col gap-4 lg:hidden">
				{skeletonData.map((_, i) => (
					<BaseMobileCard
						key={i}
						meta={<Skeleton className="h-4 w-16" />}
						title={<Skeleton className="h-4 w-32" />}
					/>
				))}
			</ul>
		</>
	);
}

function EmptyState() {
	return (
		<div className="py-8 text-center">
			<p className="text-muted-foreground">
				Eräjakoja ei ole saatavilla vielä…
			</p>
		</div>
	);
}

const participantColumns: Column<Enrollment>[] = [
	{
		header: "Varm.",
		cell: (p) =>
			p.Confirmed ? (
				<div className="flex size-5 items-center justify-center">
					<CheckCircle aria-hidden="true" className="size-3 text-white" />
				</div>
			) : null,
	},
	nameAndOrgColumn<Enrollment>(true),
	pbColumn<Enrollment>(),
	sbColumn<Enrollment>(),
];

const participantRowClassName = (p: Enrollment) =>
	p.Confirmed ? "bg-green-300/10 hover:bg-green-300/15" : "";

export function ParticipantLayout({
	enrollments,
}: {
	enrollments: Enrollment[];
}) {
	return (
		<div className="space-y-6">
			<BaseTable
				columns={participantColumns}
				data={enrollments}
				rowClassName={participantRowClassName}
			/>
			<MobileList
				data={enrollments}
				getTitle={(p) => p.Name}
				isHighlighted={(p) => p.Confirmed}
				renderMeta={(p) => <PersonalBestsMeta pb={p.PB} sb={p.SB} />}
			/>
		</div>
	);
}

export function ProtocolLayout({ isTrack }: { isTrack: boolean }) {
	const { state } = useRound();

	if (!state.currentHeat || state.heats.length === 0) {
		return <EmptyState />;
	}
	const allocations = [...state.currentHeat.Allocations];

	return (
		<HeatSelector>
			<BaseTable
				columns={[
					{
						header: isTrack ? "Rata" : "Järjestys",
						className: "w-[100px]",
						cell: (a) => <span>{!a.Number ? "" : a.Number}</span>,
					},
					nameAndOrgColumn<Allocation>(true),
					pbColumn<Allocation>(),
					sbColumn<Allocation>(),
				]}
				data={allocations}
			/>
			<MobileList
				data={allocations}
				getTitle={(a) => `${!a.Number ? "" : a.Number} ${a.Name}`}
				renderMeta={(a) => <PersonalBestsMeta pb={a.PB} sb={a.SB} />}
			/>
		</HeatSelector>
	);
}

const heatResultsColumns: Column<Allocation | TotalResult>[] = [
	{
		header: "Sija",
		className: "w-[100px]",
		cell: (a) => <span>{a.HeatRank}</span>,
	},
	nameAndOrgColumn(true),
	{
		header: "Tulos",
		cell: (a) => <AttemptsList attempts={a.Attempts} bestResult={a.Result} />,
	},
];

const totalResultsColumns: Column<Allocation | TotalResult>[] = [
	{
		header: "Sija",
		className: "w-[100px]",
		cell: (a) => <span>{a.ResultRank}</span>,
	},
	nameAndOrgColumn(true),
	{
		header: "Tulos",
		cell: (a) => <AttemptsList attempts={a.Attempts} bestResult={a.Result} />,
	},
];

// --- Result Provider (owns data fetching, exposes processed results) ---

interface ResultState {
	isLoading: boolean;
	allocations: (Allocation | TotalResult)[];
	totalResults: (Allocation | TotalResult)[];
	hasMultipleHeats: boolean;
}

const ResultContext = createContext<ResultState | undefined>(undefined);
ResultContext.displayName = "ResultContext";

function useResult() {
	const context = use(ResultContext);
	if (context === undefined) {
		throw new Error("useResult must be used within a ResultProvider");
	}
	return context;
}

export function ResultProvider({
	compId,
	isProgress,
	children,
}: {
	compId: string;
	isProgress: boolean;
	children: ReactNode;
}) {
	const comp_athletes = api.competition.getAthletes.useQuery(
		{ compId },
		{
			refetchInterval: isProgress ? 1000 : false,
			refetchIntervalInBackground: false,
			staleTime: 0,
		},
	);
	const { state } = useRound();

	if (comp_athletes.isLoading) {
		return (
			<ResultContext
				value={{
					isLoading: true,
					allocations: [],
					totalResults: [],
					hasMultipleHeats: false,
				}}
			>
				{children}
			</ResultContext>
		);
	}

	const rounds = comp_athletes.data?.Rounds ?? [];
	const currentRound = rounds.find((r) => r.Index === state.selectedRound);
	const heats = currentRound?.Heats ?? [];
	const currentHeat = heats.find((h) => h.Index === state.selectedHeat);
	const eventCategory = comp_athletes.data?.EventCategory ?? "Field";

	const allocations =
		currentHeat && heats.length > 0
			? [...currentHeat.Allocations].sort((a, b) =>
					sortByResult(a, b, eventCategory),
				)
			: [];

	const totalResults =
		currentRound?.TotalResults?.slice().sort((a, b) =>
			sortByResult(a, b, eventCategory),
		) ?? [];

	return (
		<ResultContext
			value={{
				isLoading: false,
				allocations,
				totalResults,
				hasMultipleHeats: heats.length > 1,
			}}
		>
			{children}
		</ResultContext>
	);
}

export function ResultLayout() {
	const { isLoading, allocations, totalResults, hasMultipleHeats } =
		useResult();

	if (isLoading) {
		return <LoadingState />;
	}

	if (allocations.length === 0) {
		return <EmptyState />;
	}

	return (
		<HeatSelector>
			<BaseTable columns={heatResultsColumns} data={allocations} />
			<MobileList
				data={allocations}
				getTitle={(a) => `${!a.HeatRank ? "" : a.HeatRank} ${a.Name}`}
				renderMeta={(a) => (
					<AttemptsList attempts={a.Attempts} bestResult={a.Result} />
				)}
			/>
			{hasMultipleHeats && (
				<>
					<h3 className="scroll-m-20 font-semibold text-2xl tracking-tight">
						Kokonaistulokset
					</h3>
					<BaseTable columns={totalResultsColumns} data={totalResults} />
					<MobileList
						data={totalResults}
						getTitle={(a) => `${!a.ResultRank ? "" : a.ResultRank} ${a.Name}`}
						renderMeta={(a) => (
							<AttemptsList attempts={a.Attempts} bestResult={a.Result} />
						)}
					/>
				</>
			)}
		</HeatSelector>
	);
}
