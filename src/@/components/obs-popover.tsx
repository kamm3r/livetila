"use client";

import { InfoIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useHaptics } from "~/@/hooks/use-haptics";
import { Embed } from "~/@/components/embed";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "~/@/components/ui/popover";

export function ObsPopover({ slug }: { slug: string }) {
	const [open, setOpen] = useState(false);
	const { feedback } = useHaptics();
	const actionsRef = useRef(null);
	// Use ref for one-time origin computation without causing re-renders
	const originRef = useRef(
		typeof window !== "undefined" ? window.location.origin : "",
	);

	const handleOpenChange = (newOpen: boolean) => {
		feedback("selection");
		setOpen(newOpen);
	};

	return (
		<Popover actionsRef={actionsRef} onOpenChange={handleOpenChange} open={open}>
			<PopoverTrigger
				className="inline-flex h-8 shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded border border-border bg-background bg-clip-padding px-2.5 font-medium text-sm shadow-xs outline-none hover:border-primary/50 hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0"
				render={
					<motion.button
						whileTap={{
							scale: 0.97,
							transition: {
								duration: 0.12,
								ease: [0.25, 0.1, 0.25, 1],
							},
						}}
					/>
				}
			>
				<InfoIcon aria-hidden="true" className="h-4 w-4" />
				<span className="sr-only sm:not-sr-only">OBS Overlay</span>
			</PopoverTrigger>
			<AnimatePresence>
				{open ? (
					<PopoverContent
						align="end"
						className="w-full max-w-96 origin-top-right"
						render={
							<motion.div
								initial={{ opacity: 0, scale: 0.9, y: -8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -4 }}
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 25,
								}}
							/>
						}
					>
						<PopoverHeader>
							<PopoverTitle>OBS Overlay</PopoverTitle>
							<PopoverDescription>
								jos haluut näyttää vain tietyn erän tulokset niin tee näin
							</PopoverDescription>
						</PopoverHeader>
						<div className="flex flex-col gap-4">
							<div className="space-y-2">
								<div className="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm">
									{`${originRef.current}`}/obs/{slug}
									<br />
									<span className="rounded bg-primary/20 px-1 py-0.5 text-primary">
										?round=1&heat=1
									</span>
								</div>
								<div className="text-muted-foreground text-xs">
									Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen
									mukaan.
								</div>
							</div>
							<Embed slug={slug} />
						</div>
					</PopoverContent>
				) : null}
			</AnimatePresence>
		</Popover>
	);
}
