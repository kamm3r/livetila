import dynamic from "next/dynamic";
import { Skeleton } from "~/@/components/ui/skeleton";

const SearchForm = dynamic(
	() => import("~/@/components/search-form").then((mod) => mod.SearchForm),
	{ loading: () => <Skeleton className="h-12 w-full rounded-[14px]" /> },
);

export default async function Home() {
	return (
		<>
			<main className="flex min-h-dvh flex-col items-center">
				<section className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-24">
					<div className="fade-in-0 slide-in-from-bottom-6 mx-auto max-w-3xl animate-in text-center duration-700">
						<h1 className="scroll-m-20 text-balance font-extrabold text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
							Kilpailutulokset{" "}
							<span className="font-light text-primary">reaaliajassa</span>
						</h1>
						<p className="fade-in-0 slide-in-from-bottom-4 mx-auto mt-4 max-w-xl animate-in text-pretty text-base text-muted-foreground delay-150 duration-600 sm:mt-6 sm:text-lg">
							Seuraa urheilukilpailuja livenä. Hae kilpailuja ja löydä lajit,
							joista haluat nähdä tulokset.
						</p>
					</div>

					<div className="fade-in-0 slide-in-from-bottom-4 mt-8 w-full max-w-xl animate-in px-2 delay-150 duration-500 sm:mt-10 sm:px-0">
						<SearchForm />
						<p className="mt-6 text-center text-muted-foreground text-xs sm:text-sm">
							Powered by tuloslista.com
						</p>
					</div>
				</section>
			</main>
			<footer className="border-border/50 border-t py-4 pb-[env(safe-area-inset-bottom)] sm:py-6">
				<div className="mx-auto max-w-5xl px-4 text-center">
					<p className="text-muted-foreground text-xs sm:text-sm">
						Livetila - Kilpailutulokset striimeihin
					</p>
				</div>
			</footer>
		</>
	);
}
