import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../@/components/ui/card";
import { Toaster } from "~/@/components/ui/toaster";
import { Navbar } from "./_components/navbar";
import { SearchForm } from "./_components/search-form";

export default function Home() {
    return (
        <>
            <div className="relative flex h-screen w-screen flex-col">
                <div className="flex min-h-0 flex-1 flex-col">
                    <Navbar />
                    <main className="flex flex-grow flex-col p-4 sm:p-8">
                        <div className="flex flex-col items-center">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Competition Overlay</CardTitle>
                                    <CardDescription>
                                        Get overlay for your live stream. Get competition id from
                                        live.tulospalvelu.com
                                    </CardDescription>
                                </CardHeader>
                                <SearchForm />
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
            <Toaster />
        </>
    );
}
