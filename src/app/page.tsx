import { Navbar } from "~/@/components/navbar";
import { SearchForm } from "~/@/components/search-form";

export default async function Home() {
	return (
		<div className="relative flex h-screen w-screen flex-col overflow-hidden">
			{/* Animated background blobs */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-0 -left-4 h-72 w-72 animate-pulse rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute -right-4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000" />
				<div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-500" />
			</div>

			{/* Dot grid pattern */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.15]"
				style={{
					backgroundImage:
						"radial-gradient(circle, currentColor 1px, transparent 1px)",
					backgroundSize: "32px 32px",
				}}
			/>
			<div className="flex min-h-0 flex-1 flex-col">
				<Navbar />
				<main className="flex grow flex-col items-center">
					<section className="flex flex-1 flex-col items-center justify-start px-4 py-16 sm:py-24">
						<div className="fade-in-0 slide-in-from-bottom-4 mx-auto max-w-3xl animate-in text-center duration-500">
							<h1 className="text-balance font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl">
								Kilpailutulokset{" "}
								<span className="text-primary">reaaliajassa</span>
							</h1>
							<p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
								Seuraa urheilukilpailuja livenä. Hae kilpailuja ja löydä lajit,
								joista haluat nähdä tulokset.
							</p>
						</div>

						<div className="fade-in-0 slide-in-from-bottom-4 w-full max-w-xl animate-in delay-150 duration-500">
							<SearchForm />
							<p className="mt-4 text-center text-muted-foreground text-sm">
								Powered by tuloslista.com
							</p>
						</div>
					</section>
				</main>
				{/* <footer className="border-border border-t py-8">
					<div className="mx-auto max-w-5xl px-4 text-center">
						<p className="text-muted-foreground text-sm">
							Livetila - Kilpailutulokset striimeihin
						</p>
					</div>
				</footer> */}
			</div>
		</div>
	);
}
