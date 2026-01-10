"use client";
import { Calendar, ChevronRight, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/@/components/ui/command";
import { api } from "~/trpc/react";
import type { CompetitionList, Events } from "~/types/comp";

type EventData = {
	Id: number;
	EventName: string;
	Date: string;
	Time: string;
};

// TODO: add date/time format function that takes in a date and returns a string

function extractEvents(data: Events): EventData[] {
	const results: EventData[] = [];
	for (const dateKey of Object.keys(data)) {
		data[dateKey as keyof Events].forEach((event) => {
			const compDate = new Date(event.BeginDateTimeWithTZ);
			// const year = compDate.getFullYear(); // this is in case it's needed
			const month = String(compDate.getMonth() + 1).padStart(2, "0");
			const day = String(compDate.getDate()).padStart(2, "0");
			const hours = String(compDate.getHours()).padStart(2, "0");
			const minutes = String(compDate.getMinutes()).padStart(2, "0");
			results.push({
				Id: event.EventId,
				EventName: event.EventName,
				Date: `${day}.${month}.`,
				Time: `${hours}:${minutes}`,
			});
		});
	}
	return results;
}

export function SearchForm() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [selectedComp, setSelectedComp] = useState<CompetitionList | null>(
		null,
	);
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { data: competitions, isLoading: isLoadingComps } =
		api.competition.getCompetitions.useQuery();
	const compId = selectedComp?.Id;
	// console.log("compId", compId);
	const { data: events, isLoading: isLoadingEvents } =
		api.competition.getEvents.useQuery(
			{ compId: compId! },
			{
				enabled: !!compId,
			},
		);

	// Competition filtering (only when no comp selected)
	const competitionResults =
		selectedComp || !query.trim()
			? competitions
			: competitions?.filter((comp) =>
					comp.Name.toLowerCase().includes(query.toLowerCase()),
				);

	// Event filtering (only when comp IS selected)
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

		// Reset scope if "/" is removed
		if (selectedComp && !value.includes("/")) {
			setSelectedComp(null);
			setQuery("");
		}
	}

	// old code that used url for comp and event state
	//  const params = new URLSearchParams(searchParams);
	//     if (term) {
	//       params.set("query", term);
	//     } else {
	//       params.delete("query");
	//     }

	function handleCompetitionSelect(comp: CompetitionList) {
		setSelectedComp(comp);
		setQuery(`${comp.Name} / `);
		setTimeout(() => inputRef.current?.focus(), 0);
	}

	function handleEventSelect(event: EventData) {
		if (selectedComp) {
			router.push(`/competition/${selectedComp.Id}-${event.Id}`);
		}
	}

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const showCompetitions = !selectedComp && competitionResults?.length > 0;
	const showEvents = selectedComp && eventResults.length > 0;
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
		<div className="relative w-full" ref={containerRef}>
			<Command className="overflow-visible bg-transparent" shouldFilter={false}>
				<CommandInput
					className=""
					onBlur={() => setIsOpen(false)}
					onChangeCapture={(event) => {
						handleInputChange(event.currentTarget.value);
					}}
					onFocus={() => setIsOpen(true)}
					placeholder={
						selectedComp
							? `Hae lajeja kilpailusta ${selectedComp.Name}...`
							: "Hae kilpailuja nimellä..."
					}
					ref={inputRef}
					value={query}
				/>
				{showLoading && (
					<Loader2 className="absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
				)}

				{showDropdown && (
					<div className="fade-in-0 slide-in-from-top-2 absolute top-full z-50 mt-2 w-full animate-in overflow-hidden rounded-xl border-2 border-border bg-card shadow-xl duration-200">
						<CommandList className="max-h-80">
							{showEmpty && (
								<CommandEmpty className="fade-in-0 animate-in py-6 text-center text-muted-foreground text-sm duration-200">
									{selectedComp
										? "Ei lajeja löytynyt"
										: "Ei kilpailuja löytynyt"}
								</CommandEmpty>
							)}
							{showCompetitions && (
								<CommandGroup heading="Kilpailut">
									{competitionResults?.slice(0, 10).map((comp, index) => (
										<CommandItem
											className="fade-in-0 slide-in-from-left-2 animate-in transition-all duration-150"
											key={comp.Id}
											onMouseDown={(event) => {
												event.preventDefault();
												handleCompetitionSelect(comp);
											}}
											onSelect={() => handleCompetitionSelect(comp)}
											style={{ animationDelay: `${index * 30}ms` }}
											value={`${comp.Name}-${comp.Date}-${comp.Id}`}
										>
											<div className="flex flex-1 items-center justify-between">
												<span className="font-medium">{comp.Name}</span>
												<div className="flex items-center gap-4 text-muted-foreground">
													<div className="flex items-center gap-1.5 text-sm">
														<Calendar className="h-3.5 w-3.5" />
														<span>
															{new Date(comp.Date).getDate()}.
															{new Date(comp.Date).getMonth() + 1}.
														</span>
													</div>
													<ChevronRight className="h-4 w-4 transition-transform duration-150 group-data-[selected=true]:translate-x-0.5" />
												</div>
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							)}
							{isLoadingEvents && (
								<div className="fade-in-0 animate-in px-4 py-6 text-center duration-200">
									<Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
									<p className="mt-2 text-muted-foreground text-sm">
										Ladataan lajeja...
									</p>
								</div>
							)}
							{showEvents && (
								<CommandGroup heading="Lajit">
									{eventResults.slice(0, 15).map((evt, index) => (
										<CommandItem
											className="fade-in-0 slide-in-from-left-2 animate-in transition-all duration-150"
											key={`${evt.Id}-${evt.Date}-${evt.Time}`}
											onMouseDown={(event) => {
												event.preventDefault();
												handleEventSelect(evt);
											}}
											onSelect={() => handleEventSelect(evt)}
											style={{ animationDelay: `${index * 30}ms` }}
											value={`${evt.EventName}-${evt.Date}-${evt.Time}-${evt.Id}`}
										>
											<div className="flex w-full items-center justify-between gap-4">
												<span className="font-medium">{evt.EventName}</span>
												<div className="flex items-center gap-4 text-muted-foreground">
													<div className="flex items-center gap-3 text-sm">
														<div className="flex items-center gap-1.5">
															<Clock className="h-3 w-3" />
															<span>{evt.Time}</span>
														</div>
														<div className="flex items-center gap-1.5">
															<Calendar className="h-3 w-3" />
															<span>{evt.Date}</span>
														</div>
													</div>
													<ChevronRight className="h-4 w-4 transition-transform duration-150 group-data-[selected=true]:translate-x-0.5" />
												</div>
											</div>
										</CommandItem>
									))}
								</CommandGroup>
							)}
						</CommandList>
					</div>
				)}
			</Command>
		</div>
	);
}
