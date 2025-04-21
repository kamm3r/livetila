"use client";
import Link from "next/link";
import { ThemeToggle } from "~/@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-8 sm:py-4">
      <Link href="/" className="relative text-2xl font-bold whitespace-nowrap">
        Livetila{" "}
        <sup className="absolute top-0 left-[calc(100%+.25rem)] text-xs font-extrabold text-gray-400">
          [BETA]
        </sup>
      </Link>
      <div className="">
        <ThemeToggle />
      </div>
    </header>
  );
}
