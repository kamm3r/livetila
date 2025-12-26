import { Suspense } from "react";
import { Navbar } from "~/@/components/navbar";
import { SearchForm } from "~/@/components/search-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/@/components/ui/card";

export default async function Home() {
	return (
		<div className="relative flex h-screen w-screen flex-col">
			<div className="flex min-h-0 flex-1 flex-col">
				<Navbar />
				<main className="flex grow flex-col items-center p-4 sm:p-8">
					<Card className="h-full w-full max-w-xl">
						<CardHeader>
							<CardTitle>Kilpailu Overlay</CardTitle>
							<CardDescription>
								Get overlay for your live stream. Get competition id from
								live.tulospalvelu.com
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Suspense>
								<SearchForm />
							</Suspense>
						</CardContent>
					</Card>
				</main>
			</div>
		</div>
	);
}
