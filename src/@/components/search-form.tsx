"use client";

import {
	ArrowRight,
	Calendar,
	ChevronRight,
	Clock,
	Loader2,
	Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useHaptics } from "~/@/hooks/use-haptics";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "~/@/components/ui/command";
import { api } from "~/trpc/react";
import type { CompetitionList, Events } from "~/types/comp";

type EventData = {
	Id: number;
	EventName: string;
	Name: string;
	Date: string;
	Time: string;
};

function extractEvents(data: Events): EventData[] {
	const results: EventData[] = [];
	for (const dateKey of Object.keys(data)) {
		data[dateKey]?.forEach((event) => {
			const compDate = new Date(event.BeginDateTimeWithTZ);
			const month = String(compDate.getMonth() + 1).padStart(2, "0");
			const day = String(compDate.getDate()).padStart(2, "0");
			const hours = String(compDate.getHours()).padStart(2, "0");
			const minutes = String(compDate.getMinutes()).padStart(2, "0");
			results.push({
				Id: event.EventId,
				EventName: event.EventName,
				Name: event.Name,
				Date: `${day}.${month}.`,
				Time: `${hours}:${minutes}`,
			});
		});
	}
	return results;
}

const smoothSpring = {
	type: "spring" as const,
	stiffness: 300,
	damping: 30,
	mass: 0.8,
};

const staggerChildren = {
	animate: {
		transition: {
			staggerChildren: 0.035,
		},
	},
};

const itemVariants = {
	initial: { opacity: 0, y: 8, scale: 0.97 },
	animate: { opacity: 1, y: 0, scale: 1 },
	exit: { opacity: 0, y: -4, scale: 0.98 },
};

const groupHeadingClassName =
	"**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-muted-foreground/70 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wider";

export function SearchForm() {
	const router = useRouter();
	const { feedback } = useHaptics();
	const [query, setQuery] = useState("");
	const [selectedComp, setSelectedComp] = useState<CompetitionList | null>(
		null,
	);
	const [isOpen, setIsOpen] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [navigatingTo, setNavigatingTo] = useState<number | null>(null);
	const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { data: competitions, isLoading: isLoadingComps } =
		api.competition.getCompetitions.useQuery();
	const { data: events, isLoading: isLoadingEvents } =
		api.competition.getEvents.useQuery(
			{ compId: selectedComp?.Id.toString() ?? "" },
			{ enabled: !!selectedComp },
		);

	const competitionResults =
		selectedComp || !query.trim()
			? competitions?.sort((a, b) => b.Date.localeCompare(a.Date))
			: competitions?.filter((comp) =>
				comp.Name.toLowerCase().includes(query.toLowerCase()),
			);

	const eventQuery =
		selectedComp && query.includes("/")
			? (query.split("/").pop()?.trim() ?? "")
			: "";

	const eventResults =
		selectedComp && events
			? extractEvents(events)
				.filter(
					(evt) =>
						!eventQuery ||
						evt.EventName.toLowerCase().includes(eventQuery.toLowerCase()),
				)
				.sort((a, b) => a.Time.localeCompare(b.Time))
			: [];

	function handleInputChange(value: string) {
		setIsOpen(true);
		setQuery(value);
		if (selectedComp && !value.includes("/")) {
			setSelectedComp(null);
			setQuery("");
		}
	}

	function handleCompetitionSelect(comp: CompetitionList) {
		feedback("selection");
		setSelectedComp(comp);
		setQuery(`${comp.Name} / `);
		inputRef.current?.focus();
	}

	function handleEventSelect(event: EventData) {
		if (selectedComp && navigatingTo === null) {
			feedback("success");
			setNavigatingTo(event.Id);
			router.push(`/competition/${selectedComp.Id}-${event.Id}`);
		}
	}

	function handleBlur() {
		blurTimeoutRef.current = setTimeout(() => {
			setIsOpen(false);
			setIsFocused(false);
		}, 150);
	}

	function handleFocus() {
		if (blurTimeoutRef.current) {
			clearTimeout(blurTimeoutRef.current);
		}
		setIsOpen(true);
		setIsFocused(true);
	}

	const showCompetitions =
		!selectedComp && (competitionResults?.length ?? 0) > 0;
	const showEvents =
		selectedComp && eventResults.length > 0 && !isLoadingEvents;
	const showLoading = isLoadingComps || isLoadingEvents;
	const showEmpty =
		isOpen &&
		query.length > 0 &&
		!showCompetitions &&
		!showEvents &&
		!showLoading;
	const showDropdown =
		isOpen && (showCompetitions || showEvents || showLoading || showEmpty);

	return (
		<div className="relative mx-auto w-full max-w-2xl">
			<Command
				className="overflow-visible bg-transparent"
				role="search"
				shouldFilter={false}
			>
				<motion.div
					animate={{
						scale: isFocused ? 1.01 : 1,
						boxShadow: showDropdown
							? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)"
							: isFocused
								? "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)"
								: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
					}}
					className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl"
					transition={smoothSpring}
				>
					{/* Gradient border effect */}
					<motion.div
						animate={{
							opacity: isFocused ? 1 : 0,
						}}
						className="pointer-events-none absolute inset-0 rounded-2xl"
						style={{
							background:
								"linear-gradient(135deg, rgba(113, 180, 255, 0.15) 0%, rgba(113, 180, 255, 0.05) 50%, rgba(113, 180, 255, 0.15) 100%)",
						}}
						transition={{ duration: 0.3 }}
					/>

					{/* Input Section */}
					<div className="relative z-10">
						<div className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
							<motion.div
								animate={{
									scale: isFocused ? 1.1 : 1,
									color: isFocused
										? "var(--color-primary)"
										: "var(--color-muted-foreground)",
								}}
								transition={smoothSpring}
							>
								<Search className="size-5" />
							</motion.div>

							<input
								ref={inputRef}
								className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"
								onBlur={handleBlur}
								onChange={(e) => handleInputChange(e.target.value)}
								onFocus={handleFocus}
								placeholder={
									selectedComp
										? `Hae lajeja...`
										: "Hae kilpailuja nimellä..."
								}
								type="text"
								value={query}
							/>

							{/* Loading indicator */}
							<AnimatePresence>
								{showLoading && (
									<motion.div
										animate={{ opacity: 1, scale: 1, rotate: 0 }}
										exit={{ opacity: 0, scale: 0.8 }}
										initial={{ opacity: 0, scale: 0.8 }}
									>
										<Loader2 className="size-5 animate-spin text-primary" />
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					{/* Divider */}
					<AnimatePresence>
						{showDropdown && (
							<motion.div
								animate={{ scaleX: 1, opacity: 1 }}
								className="mx-4 h-px bg-linear-to-r from-transparent via-border to-transparent"
								exit={{ scaleX: 0, opacity: 0 }}
								initial={{ scaleX: 0, opacity: 0 }}
								transition={{ duration: 0.2 }}
							/>
						)}
					</AnimatePresence>

					{/* Dropdown */}
					<AnimatePresence mode="wait">
						{showDropdown && (
							<motion.div
								animate={{ height: "auto", opacity: 1 }}
								className="overflow-hidden"
								exit={{ height: 0, opacity: 0 }}
								initial={{ height: 0, opacity: 0 }}
								key={selectedComp ? "events-list" : "competitions-list"}
								transition={{ duration: 0.2, ease: "easeOut" }}
							>
								<div className="p-2">
									<CommandList className="max-h-80 overflow-y-auto">
										{showEmpty && (
											<motion.div
												animate={{ opacity: 1, y: 0 }}
												initial={{ opacity: 0, y: 10 }}
											>
												<CommandEmpty className="flex flex-col items-center gap-2 py-8 text-center">
													<div className="rounded-full bg-muted p-3">
														<Search className="size-5 text-muted-foreground" />
													</div>
													<p className="text-muted-foreground text-sm">
														{selectedComp
															? "Ei lajeja löytynyt"
															: "Ei kilpailuja löytynyt"}
													</p>
												</CommandEmpty>
											</motion.div>
										)}

										{showCompetitions && (
											<CommandGroup
												className={groupHeadingClassName}
												heading="Kilpailut"
											>
												<motion.div
													animate="animate"
													initial="initial"
													variants={staggerChildren}
												>
													{competitionResults?.slice(0, 10).map((comp) => (
														<motion.div
															key={comp.Id}
															variants={itemVariants}
															transition={smoothSpring}
															whileTap={{ scale: 0.97 }}
														>
															<CommandItem
																className="group cursor-pointer rounded-xl px-2 py-2 transition-colors data-[selected=true]:bg-primary/10 active:bg-primary/15 sm:px-3 sm:py-2.5"
																onMouseDown={(event) => event.preventDefault()}
																onSelect={() => handleCompetitionSelect(comp)}
																value={`${comp.Name}-${comp.Date}-${comp.Id}`}
															>
																<div className="flex flex-1 items-center justify-between gap-2 sm:gap-3">
																	<div className="flex items-center gap-2 sm:gap-3">
																		<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground sm:size-9">
																			<Calendar className="size-4" />
																		</div>
																		<div className="flex flex-col">
																			<span className="font-medium text-foreground text-sm sm:text-base">
																				{comp.Name}
																			</span>
																			<span className="text-muted-foreground text-xs">
																				{new Date(comp.Date).toLocaleDateString(
																					"fi-FI",
																					{
																						day: "numeric",
																						month: "long",
																						year: "numeric",
																					},
																				)}
																			</span>
																		</div>
																	</div>
																	<ArrowRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-data-[selected=true]:translate-x-0.5 group-data-[selected=true]:text-primary group-data-[selected=true]:opacity-100" />
																</div>
															</CommandItem>
														</motion.div>
													))}
												</motion.div>
											</CommandGroup>
										)}

										{isLoadingEvents && (
											<motion.div
												animate={{ opacity: 1 }}
												className="flex flex-col items-center gap-3 py-8"
												initial={{ opacity: 0 }}
											>
												<div className="relative">
													<div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
													<Loader2 className="relative size-6 animate-spin text-primary" />
												</div>
												<p className="text-muted-foreground text-sm">
													Ladataan lajeja...
												</p>
											</motion.div>
										)}

										{showEvents && (
											<CommandGroup
												className={groupHeadingClassName}
												heading="Lajit"
											>
												<motion.div
													animate="animate"
													initial="initial"
													variants={staggerChildren}
												>
													{eventResults.slice(0, 15).map((evt) => {
														const isNavigating = navigatingTo === evt.Id;
														const isDisabled = navigatingTo !== null && !isNavigating;
														return (
															<motion.div
																key={`${evt.Id}-${evt.Date}-${evt.Time}`}
																variants={itemVariants}
																transition={smoothSpring}
																whileTap={isDisabled ? undefined : { scale: 0.97 }}
															>
																<CommandItem
																	className="group cursor-pointer rounded-xl px-2 py-2 transition-all data-[selected=true]:bg-primary/10 active:bg-primary/15 disabled:pointer-events-none sm:px-3 sm:py-2.5"
																	disabled={isDisabled}
																	onMouseDown={(event) => {
																		event.preventDefault();
																		handleEventSelect(evt);
																	}}
																	onSelect={() => handleEventSelect(evt)}
																	style={{ opacity: isDisabled ? 0.4 : 1 }}
																	value={`${evt.EventName}-${evt.Date}-${evt.Time}-${evt.Id}`}
																>
																	<div className="flex w-full items-center justify-between gap-2 sm:gap-3">
																		<div className="flex items-center gap-2 sm:gap-3">
																			<div className="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-data-[selected=true]:bg-primary group-data-[selected=true]:text-primary-foreground sm:size-9">
																				{isNavigating ? (
																					<Loader2 className="size-4 animate-spin" />
																				) : (
																					<Clock className="size-4" />
																				)}
																			</div>
																			<div className="flex flex-col">
																				<span className="font-medium text-foreground text-sm sm:text-base">
																					{evt.EventName}
																				</span>
																				<AnimatePresence mode="wait">
																					{isNavigating ? (
																						<motion.span
																							key="loading-label"
																							animate={{ opacity: 1, y: 0 }}
																							className="text-primary text-xs"
																							exit={{ opacity: 0, y: -4 }}
																							initial={{ opacity: 0, y: 4 }}
																							transition={{ duration: 0.15 }}
																						>
																							Siirrytään...
																						</motion.span>
																					) : (
																						<motion.span
																							key="round-label"
																							animate={{ opacity: 1, y: 0 }}
																							className="text-muted-foreground text-xs"
																							exit={{ opacity: 0, y: 4 }}
																							initial={{ opacity: 0, y: -4 }}
																							transition={{ duration: 0.15 }}
																						>
																							{evt.Name}
																						</motion.span>
																					)}
																				</AnimatePresence>
																			</div>
																		</div>
																		<div className="flex items-center gap-2 sm:gap-3">
																			<div className="hidden items-center gap-2 text-muted-foreground text-xs sm:flex">
																				<span className="rounded-md bg-muted px-2 py-0.5 font-mono">
																					{evt.Time}
																				</span>
																				<span>{evt.Date}</span>
																			</div>
																			<span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs sm:hidden">
																				{evt.Time}
																			</span>
																			{isNavigating ? (
																				<div className="size-4" />
																			) : (
																				<ChevronRight className="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-data-[selected=true]:translate-x-0.5 group-data-[selected=true]:text-primary group-data-[selected=true]:opacity-100" />
																			)}
																		</div>
																	</div>
																</CommandItem>
															</motion.div>
														);
													})}
												</motion.div>
											</CommandGroup>
										)}
									</CommandList>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</Command>

			{/* Hint text */}
			<AnimatePresence>
				{!showDropdown && (
					<motion.p
						animate={{ opacity: 1, y: 0 }}
						className="mt-3 text-center text-muted-foreground/60 text-xs"
						exit={{ opacity: 0, y: -5 }}
						initial={{ opacity: 0, y: 5 }}
						transition={{ delay: 0.1 }}
					>
						Vinkki: valitse kilpailu ja rajaa laji kirjoittamalla {`"/"`}
					</motion.p>
				)}
			</AnimatePresence>
		</div>
	);
}
