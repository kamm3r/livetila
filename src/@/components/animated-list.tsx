"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type React from "react";

export function AnimatedList({ children }: { children: React.ReactNode }) {
	const [parent] = useAutoAnimate();
	return (
		<ul className="flex flex-col gap-1" ref={parent}>
			{children}
		</ul>
	);
}
