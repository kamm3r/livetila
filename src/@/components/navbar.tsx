"use client";
import { MoonIcon, SunIcon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "~/@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/@/components/ui/dropdown-menu";

export function Navbar() {
	const { setTheme } = useTheme();
	return (
		<header className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-8 sm:py-4">
			<Link className="relative whitespace-nowrap font-bold text-2xl" href="/">
				Livetila{" "}
				<sup className="absolute top-0 left-[calc(100%+.25rem)] font-extrabold text-gray-400 text-xs">
					[BETA]
				</sup>
			</Link>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<Button size="icon" variant="outline">
						<SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
						<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => setTheme("light")}>
						Light
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("dark")}>
						Dark
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setTheme("system")}>
						System
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
