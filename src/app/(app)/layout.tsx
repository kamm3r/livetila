"use client";
import { Navbar } from "~/@/components/navbar";
import { ThemeProvider } from "~/@/components/theme-provider";
import { Toaster } from "~/@/components/ui/sonner";

export default function ThemedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<div className="relative flex h-screen w-screen flex-col overflow-hidden">
				{/* Animated background blobs
				<div className="pointer-events-none absolute inset-0 overflow-hidden">
					<div className="absolute top-0 -left-4 h-72 w-72 animate-pulse rounded-full bg-primary/10 blur-3xl" />
					<div className="absolute -right-4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000" />
					<div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-purple-500/10 blur-3xl delay-500" />
				</div>

				Dot grid pattern
				<div
					className="pointer-events-none absolute inset-0 opacity-[0.15]"
					style={{
						backgroundImage:
							"radial-gradient(circle, currentColor 1px, transparent 1px)",
						backgroundSize: "32px 32px",
					}}
				/> */}
				<div className="flex min-h-0 flex-1 flex-col">
					<Navbar />
					{children}
				</div>
			</div>
			<Toaster position="top-right" />
		</ThemeProvider>
	);
}
