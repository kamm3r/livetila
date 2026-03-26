"use client";

import { InfoIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Embed } from "~/@/components/embed";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "~/@/components/ui/drawer";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "~/@/components/ui/popover";
import { useHaptics } from "~/@/hooks/use-haptics";


function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const onChange = () => {
      setIsMobile(media.matches);
    };

    onChange();
    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [breakpoint]);

  return isMobile;
}

export function ObsPopover({ slug }: { slug: string }) {
	const [open, setOpen] = useState(false);
	const { feedback } = useHaptics();
	const actionsRef = useRef(null);
	const originRef = useRef(
		typeof window !== "undefined" ? window.location.origin : "",
	);
	 const isMobile = useIsMobile();

	const handleOpenChange = (newOpen: boolean) => {
		feedback("selection");
		setOpen(newOpen);
	};

	const content = (
		<>
			<div className="space-y-2">
				<div className="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm">
					{`${originRef.current}`}/obs/{slug}
					<br />
					<span className="rounded bg-primary/20 px-1 py-0.5 text-primary">
						?round=1&heat=1
					</span>
				</div>
				<div className="text-muted-foreground text-xs">
					Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen mukaan.
				</div>
			</div>
			<Embed slug={slug} />
		</>
	);
if (isMobile) {
    return (
			<Drawer onOpenChange={handleOpenChange} open={open}>
				<DrawerTrigger 
					className="sm:hidden inline-flex gap-2 items-center justify-center" 
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
					<InfoIcon aria-hidden="true" className="size-4" />
					<span className="sr-only sm:not-sr-only">OBS Overlay</span>
				</DrawerTrigger>
				<DrawerContent className="sm:hidden">
					<DrawerHeader>
						<DrawerTitle>OBS Overlay</DrawerTitle>
						<DrawerDescription>
							jos haluut näyttää vain tietyn erän tulokset niin tee näin
						</DrawerDescription>
					</DrawerHeader>
					<div className="flex flex-col gap-4 px-4 pt-2 pb-8">{content}</div>
				</DrawerContent>
			</Drawer>
	)
}
	return (
			<Popover
				actionsRef={actionsRef}
				onOpenChange={handleOpenChange}
				open={open}
			>
				<PopoverTrigger
					className="hidden sm:inline-flex gap-2 items-center justify-center"
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
					<InfoIcon aria-hidden="true" className="size-4" />
					<span className="sr-only sm:not-sr-only">OBS Overlay</span>
				</PopoverTrigger>
				<AnimatePresence>
					{open ? (
						<PopoverContent
							align="end"
							className="hidden w-full max-w-96 origin-top-right sm:flex"
							render={
								<motion.div
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95, y: -4 }}
									initial={{ opacity: 0, scale: 0.9, y: -8 }}
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
							<div className="flex flex-col gap-4">{content}</div>
						</PopoverContent>
					) : null}
				</AnimatePresence>
			</Popover>
	);
}
