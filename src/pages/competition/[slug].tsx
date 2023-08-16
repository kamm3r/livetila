import Link from 'next/link'
import Head from "next/head";
import { useRouter } from "next/router";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "~/@/components/ui/table";
import { api } from "~/utils/api";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/@/components/ui/dropdown-menu';
import { InfoIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '~/@/components/ui/button';
import { useTheme } from 'next-themes';
import { Input } from '~/@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '~/@/components/ui/popover';
import { Label } from '~/@/components/ui/label';

function butterParse(a: string): number {
    if (Number.isNaN(a)) {
        return 0;
    } else {
        return parseFloat(a);
    }
}

export default function Comp() {
    const { setTheme } = useTheme()
    const router = useRouter();
    const compId = (router.query.slug as string)?.replace("-", "/");
    const { data, isLoading } = api.competition.getAthletes.useQuery(
        { compId },
        { refetchInterval: 1000 },
    );
    if (!data || isLoading) {
        return "loading...";
    }
    console.log("data", data);
    return (
        <>
            <Head>
                <title>Livetila - kisa</title>
            </Head>

            <header className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-8 sm:py-4">
                <Link
                    href="/"
                    className="relative whitespace-nowrap text-2xl font-bold"
                >
                    Livetila{" "}
                    <sup className="absolute left-[calc(100%+.25rem)] top-0 text-xs font-extrabold text-gray-400">
                        [BETA]
                    </sup>
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme('light')}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('dark')}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme('system')}>

                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main className="flex flex-grow flex-col p-4 sm:p-8 relative">
                <Popover>
                    <PopoverTrigger asChild className="absolute top-9 right-5 z-50">
                        <Button variant="ghost" className='px-2'>
                            <InfoIcon />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Dimensions</h4>
                                <p className="text-sm text-muted-foreground">
                                    Set the dimensions for the layer.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="width">Width</Label>
                                    <Input
                                        id="width"
                                        defaultValue="100%"
                                        className="col-span-2 h-8"
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="maxWidth">Max. width</Label>
                                    <Input
                                        id="maxWidth"
                                        defaultValue="300px"

                                        className="col-span-2 h-8"

                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="height">Height</Label>
                                    <Input
                                        id="height"
                                        defaultValue="25px"
                                        className="col-span-2 h-8"
                                    />
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="maxHeight">Max. height</Label>
                                    <Input
                                        id="maxHeight"
                                        defaultValue="none"
                                        className="col-span-2 h-8"
                                    />
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                <Table className="relative">
                    <TableHeader className="sticky top-0 backdrop-blur-md">
                        <TableRow>
                            <TableHead className="w-[100px]">Sija</TableHead>
                            <TableHead>Nimi</TableHead>
                            <TableHead>Seura</TableHead>
                            <TableHead>Tulos</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="overflow-y-auto">
                        {data.Rounds.map((r) =>
                            r.Heats.map((h) =>
                                h.Allocations.sort(
                                    (a, b) => butterParse(b.Result) - butterParse(a.Result),
                                ).map((a, i) => (
                                    <TableRow className="w-full max-w-[400px]" key={i}>
                                        <TableCell>{a.ResultRank}</TableCell>
                                        <TableCell>{a.Name}</TableCell>
                                        <TableCell>{a.Organization.Name}</TableCell>
                                        <TableCell>
                                            <ul className="flex gap-2">
                                                {a.Attempts
                                                    ? a.Attempts.map((at, id) => (
                                                        <li
                                                            key={id}
                                                            className="-my-1 rounded bg-neutral-600/50 px-2 py-1 text-sm"
                                                        >
                                                            {at.Line1.toUpperCase()}
                                                        </li>
                                                    ))
                                                    : "no bitch"}
                                            </ul>
                                        </TableCell>
                                    </TableRow>
                                )),
                            ),
                        )}
                    </TableBody>
                </Table>
            </main>
        </>
    );
}
