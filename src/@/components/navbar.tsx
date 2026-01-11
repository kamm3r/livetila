import Link from "next/link";
import { ModeSwitcher } from "~/@/components/mode-switcher";

export function Navbar() {
	return (
		<header className="flex items-center justify-between px-4 pt-4 pb-2 sm:px-8 sm:py-4">
			<Link className="relative whitespace-nowrap font-bold text-2xl" href="/">
				Livetila{" "}
				<sup className="absolute top-0 left-[calc(100%+.25rem)] font-extrabold text-muted-foregroundz text-xs">
					[BETA]
				</sup>
			</Link>
			<ModeSwitcher />
		</header>
	);
}
