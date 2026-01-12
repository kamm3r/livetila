"use client";

import { Navbar } from "~/@/components/navbar";
import { ThemeProvider } from "~/@/components/theme-provider";
import { Toaster } from "~/@/components/ui/sonner";

export default function ThemedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			<div className="relative flex min-h-dvh flex-col pt-[env(safe-area-inset-top)">
				<div className="flex min-h-0 flex-1 flex-col">
					<Navbar />
					{children}
				</div>
			</div>
			<Toaster position="top-right" />
		</ThemeProvider>
	);
}
