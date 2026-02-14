import { Skeleton } from "~/@/components/ui/skeleton";

const SKELETON_ROWS = ["r1", "r2", "r3", "r4", "r5", "r6"];

export default function CompetitionLoading() {
	return (
		<main className="container mx-auto flex grow flex-col p-4 sm:p-8">
			<div className="flex flex-wrap items-end justify-between gap-2">
				<div className="flex flex-col items-start gap-2">
					<Skeleton className="h-9 w-64" />
					<Skeleton className="h-10 w-80" />
				</div>
				<Skeleton className="h-8 w-28" />
			</div>
			<div className="mt-4">
				<Skeleton className="h-10 w-full" />
			</div>
			<div className="mt-4 space-y-3">
				{SKELETON_ROWS.map((id) => (
					<Skeleton className="h-14 w-full" key={id} />
				))}
			</div>
		</main>
	);
}
