"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/@/components/ui/button";

const EASE_STANDARD: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const contentTransition = {
	duration: 0.2,
	ease: EASE_STANDARD
};

const contentMotion = {
	initial: {
		opacity: 0,
		filter: "blur(2px)",
		// transform: "scale(0.97)",
	},
	animate: {
		opacity: 1,
		filter: "blur(0px)",
		// transform: "scale(1)",
	},
	exit: {
		opacity: 0,
		filter: "blur(2px)",
		// transform: "scale(0.97)",
	},
	transition: contentTransition,
};

export function Embed({ slug }: { slug: string }) {
	const searchParams = useSearchParams();
	const round = searchParams.get("round");
	const [copy, setCopy] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Cleanup timeout on unmount to prevent memory leak
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	function copyUrlToClipboard() {
		void navigator.clipboard.writeText(
			`${window.location.origin}/obs/${slug}?${!round ? "" : "round=1&"}${
				round === "Final" ? "" : "heat=1"
			}`,
		)
		setCopy(true);
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		toast.info("Linkki kopioitu leikepöydälle");

		timeoutRef.current = setTimeout(() => {
			setCopy(false);
			timeoutRef.current = null;
		}, 1500);
	}

	return (
		<Button
			aria-label={copy ? "Copied" : "Copy to clipboard"}
			className="w-full gap-2 transition-none active:translate-y-0!"
			onClick={copyUrlToClipboard}
			render={
				<motion.button
					whileTap={{
						scale: 0.97,
						transition: {
							duration: 0.16,
							ease: "easeOut"
						},
					}}
				/>
			}
			size="icon"
			variant="secondary"
		>
			<div className="relative flex size-4 items-center justify-center">
				<AnimatePresence initial={false}>
					{copy ? (
						<motion.span
						key="check"
							className="absolute inset-0"
							{...contentMotion}
						>
							<CheckIcon aria-hidden="true" className="size-4" />
						</motion.span>
					) : (
						<motion.span
							key="copy"
							className="absolute inset-0"
							{...contentMotion}
						>
							<CopyIcon aria-hidden="true" className="size-4" />
						</motion.span>
					)}
				</AnimatePresence>
			</div>

			<div className="relative">
				<AnimatePresence initial={false} mode="wait">
					<motion.span
						key={copy ? "copied" : "copy"}
						className="text-sm flex items-center whitespace-nowrap"
						{...contentMotion}
					>
						{copy ? "Kopioitu!" : "Kopioi linkki"}
					</motion.span>
				</AnimatePresence>
			</div>
		</Button>
	);
}
