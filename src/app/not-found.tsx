import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Page not found",
	description: "page not found 404",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function NotFound() {
	return (
		<div className="flex h-screen flex-col items-center justify-center text-center">
			<Link className="text-secondary-foreground underline" href="/">
				Home
			</Link>
			<div className="flex flex-col">
				<h1 className="font-bold text-9xl">404</h1>
				<h2 className="font-bold text-4xl">Page not found</h2>
			</div>
		</div>
	);
}
