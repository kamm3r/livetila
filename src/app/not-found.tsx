import Link from "next/link";

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
