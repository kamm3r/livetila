"use client";
import Link from "next/link";
import { ThemeToggle } from "~/@/components/theme-toggle";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const hideNavbar = pathname.includes("/obs/");
  return hideNavbar ? null : (
    <header className="container mx-auto flex items-center justify-between pt-4 pb-2 sm:py-4">
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
