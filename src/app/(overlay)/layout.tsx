import { Suspense } from "react";

export default function ThemedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="fixed inset-0 z-50">
			<Suspense>{children}</Suspense>
		</div>
	);
}
