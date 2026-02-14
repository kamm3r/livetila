"use client";

import Link from "next/link";

export default function CompetitionError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<main className="container mx-auto flex grow flex-col items-center justify-center p-4 text-center sm:p-8">
			<h2 className="font-semibold text-2xl">
				Kilpailun lataaminen epäonnistui
			</h2>
			<p className="mt-2 text-muted-foreground">
				Tuloksia ei voitu hakea. Palvelu saattaa olla tilapäisesti poissa
				käytöstä.
			</p>
			<div className="mt-6 flex gap-3">
				<button
					className="rounded-md bg-primary px-4 py-2 text-primary-foreground text-sm hover:bg-primary/90"
					onClick={() => reset()}
					type="button"
				>
					Yritä uudelleen
				</button>
				<Link
					className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
					href="/"
				>
					Etusivulle
				</Link>
			</div>
		</main>
	);
}
