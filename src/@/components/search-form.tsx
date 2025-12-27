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
import { tryCatch } from "~/shared/try-catch";
import type { CompetitionList, Events } from "~/types/comp";

type EventData = {
	Id: number;
	EventName: string;
	Date: string;
	Time: string;
};

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

async function getCompData() {
	const { data, error } = await tryCatch(
		fetch("https://cached-public-api.tuloslista.com/live/v1/competition"),
	);

	if (error || !data) {
		console.error("Error fetching comp data:", error);
		return [];
	}
	return (await data.json()) as CompetitionList[];
}

async function getEventData(compId: number) {
	const { data, error } = await tryCatch(
		fetch(
			`https://cached-public-api.tuloslista.com/live/v1/competition/${compId}`,
		),
	);
	if (error || !data) {
		console.error("Error fetching comp data:", error);
		return [];
	}
	return (await data.json()) as Events;
}

export function SearchForm() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [competitions, setCompetitions] = useState<CompetitionList[]>([]);
	const [selectedComp, setSelectedComp] = useState<CompetitionList | null>(
		null,
	);
	const [events, setEvents] = useState<EventData[]>([]);
	const [isLoadingComps, setIsLoadingComps] = useState(false);
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	async function searchCompetitions(query: string) {
		setIsLoadingComps(true);
		const data = await getCompData();
		if (!query || !query.trim()) {
			setCompetitions(data);
			setIsLoadingComps(false);
			return;
		}
		const filtered = data.filter((comp) =>
			comp.Name.toLowerCase().includes(query.toLowerCase()),
		);
		setCompetitions(filtered);
		setIsLoadingComps(false);
	}

	async function searchEvents(comp: CompetitionList, query: string) {
		setIsLoadingEvents(true);
		const events = await getEventData(comp.Id);
		const allEvents = extractEvents(events);
		if (!query || query.trim() === "") {
			setEvents(allEvents.sort((a, b) => a.Time.localeCompare(b.Time)));
			setIsLoadingEvents(false);
			return;
		}
		const normalizedQuery = query.toLowerCase();
		const filtered = allEvents.filter((event) =>
			event.EventName.toLowerCase().includes(normalizedQuery),
		);
		setEvents(filtered);

		setIsLoadingEvents(false);
	}

	// old code that used url for comp and event state
	//  const params = new URLSearchParams(searchParams);
	//     if (term) {
	//       params.set("query", term);
	//     } else {
	//       params.delete("query");
	//     }

	function handleInputChange(value: string) {
		setQuery(value);
		setIsOpen(true);

		// Only reset scope if we're removing the "/" entirely
		if (selectedComp && !value.includes("/")) {
			setSelectedComp(null);
			setEvents([]);
			setQuery("");
			return;
		}
		if (selectedComp) {
			const parts = value.split("/");
			const eventQuery = parts[parts.length - 1]?.trim() || "";
			void searchEvents(selectedComp, eventQuery);
		} else {
			void searchCompetitions(value);
		}

		setQuery(value);
	}

	function handleCompetitionSelect(comp: CompetitionList) {
		setSelectedComp(comp);
		setQuery(`${comp.Name} / `);
		setCompetitions([]);
		void searchEvents(comp, "");
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

	const showCompetitions = !selectedComp && competitions.length > 0;
	const showEvents = selectedComp && events.length > 0;
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
									{competitions.slice(0, 10).map((comp, index) => (
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
												<div className="flex items-center gap-1.5 text-sm">
													<span className="text-muted-foreground">
														{new Date(comp.Date).getDate()}.
														{new Date(comp.Date).getMonth() + 1}.
													</span>
													<ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-data-[selected=true]:translate-x-0.5" />
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
									{events.slice(0, 15).map((evt, index) => (
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
												<ul className="flex items-center gap-3 text-muted-foreground">
													<li className="flex items-center gap-1.5 text-sm">
														<Clock className="h-3 w-3" />
														<span className="text-sm">{evt.Time}</span>
													</li>
													<li className="flex items-center gap-1.5 text-sm">
														<Calendar className="h-3 w-3" />
														<span className="text-sm">{evt.Date}</span>
													</li>
												</ul>
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
