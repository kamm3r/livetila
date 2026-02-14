"use client";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="fi">
			<body>
				<div className="flex min-h-screen flex-col items-center justify-center text-center">
					<h1 className="font-bold text-4xl">Jokin meni pieleen</h1>
					<p className="mt-2 text-gray-600">
						Odottamaton virhe tapahtui. Yritä uudelleen.
					</p>
					<button
						className="mt-4 rounded bg-black px-4 py-2 text-white hover:bg-gray-800"
						onClick={() => reset()}
						type="button"
					>
						Yritä uudelleen
					</button>
				</div>
			</body>
		</html>
	);
}
