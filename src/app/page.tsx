import { Suspense } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../@/components/ui/card";
import { Navbar } from "~/@/components/navbar";
import { SearchForm } from "~/@/components/search-form";

export default async function Home() {
  return (
    <div className="relative flex h-screen w-screen flex-col">
      <div className="flex min-h-0 flex-1 flex-col">
        <Navbar />
        <main className="flex flex-grow flex-col items-center p-4 sm:p-8">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Kilpailu Overlay</CardTitle>
              <CardDescription>
                Get overlay for your live stream. Get competition id from
                live.tulospalvelu.com
              </CardDescription>
            </CardHeader>
            <Suspense>
              <SearchForm />
            </Suspense>
          </Card>
        </main>
      </div>
    </div>
  );
}
