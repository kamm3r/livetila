"use client";
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
import type { Heat } from "~/types/comp";

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
// TODO: maybe combine this with the participant and protocol look at mockup that the
// layout will stay the same on both componnent but the data will be different but result
// is different as it show heat result and the end result
export function CompetitionLayout() {
	const {
		currentHeat,
		// selectedRound,
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
					<Table className="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block">
						<TableHeader className="sticky top-0 backdrop-blur-md">
							<TableRow>
								<TableHead className="w-[100px]">Sija</TableHead>
								<TableHead className="w-full">Nimi ja Seura</TableHead>
								<TableHead>PB</TableHead>
								<TableHead>SB</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<Suspense>
								{currentHeat?.Allocations.sort(
									(a, b) => a.Position - b.Position,
								).map((allocation) => (
									<TableRow
										className="w-full max-w-[400px]"
										key={allocation.Id}
									>
										<Suspense>
											<TableCell>{allocation.Position}</TableCell>
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
												<span className="font-medium">
													{allocation.PB || "-"}
												</span>
											</TableCell>
											<TableCell>
												<span className="font-medium">
													{allocation.SB || "-"}
												</span>
											</TableCell>
										</Suspense>
									</TableRow>
								))}
							</Suspense>
						</TableBody>
					</Table>
				</div>
			)}
		</>
	);
}

export function ResultLayout() {
	const {
		currentHeat,
		// selectedRound,
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
								{currentHeat?.Allocations.sort(
									(a, b) => a.ResultRank! - b.ResultRank!,
								).map((allocation) => (
									<TableRow
										className="w-full max-w-[400px]"
										key={allocation.Id}
									>
										<Suspense>
											<TableCell>{allocation.Position}</TableCell>
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
															? allocation.Attempts.map((at, index) => (
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
											</TableCell>
										</Suspense>
									</TableRow>
								))}
							</Suspense>
						</TableBody>
					</Table>
				</div>
			)}
		</>
	);
}
