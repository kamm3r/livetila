import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "~/@/components/theme-provider";
import { Toaster } from "~/@/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Livetila",
	description: "live.tuloslista API, live result overlay for Live streams",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			className={`${GeistSans.className}`}
			lang="en"
			suppressHydrationWarning
		>
			<body>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<TRPCReactProvider>{children}</TRPCReactProvider>
					<Toaster position="top-right" />
				</ThemeProvider>
			</body>
		</html>
	);
}
