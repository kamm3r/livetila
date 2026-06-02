<script lang="ts">
	import { ArrowRight, Calendar, ChevronRight, Clock, Loader2, Search } from "@lucide/svelte";
	import { goto } from "$app/navigation";
	import { animate, scroll, inView } from "motion";
	import { triggerHaptic } from "$lib/hooks/use-haptics";
	import { api } from "$lib/api";
	import type { CompetitionList, Events } from "~/types/comp";
	import { cn } from "$lib/utils";

	type EventData = {
		Id: number;
		EventName: string;
		Name: string;
		Date: string;
		Time: string;
	};

	type SearchStep = "competitions" | "events";

	function extractEvents(data: Events): EventData[] {
		const results: EventData[] = [];
		for (const dateKey of Object.keys(data)) {
			const events = data[dateKey];
			if (events) {
				for (const event of events) {
					const compDate = new Date(event.BeginDateTimeWithTZ);
					results.push({
						Id: event.EventId,
						EventName: event.EventName,
						Name: event.Name,
						Date: `${String(compDate.getDate()).padStart(2, "0")}.${String(compDate.getMonth() + 1).padStart(2, "0")}.`,
						Time: `${String(compDate.getHours()).padStart(2, "0")}:${String(compDate.getMinutes()).padStart(2, "0")}`,
					});
				}
			}
		}
		return results;
	}

	let query = $state("");
	let isOpen = $state(false);
	let isFocused = $state(false);
	let selectedComp = $state<CompetitionList | null>(null);
	let navigatingTo = $state<number | null>(null);
	let inputEl: HTMLInputElement | undefined = $state(undefined);

	let competitions = $state<CompetitionList[]>([]);
	let events = $state<Events>({});
	let isLoadingComps = $state(true);
	let isLoadingEvents = $state(false);

	$effect(() => {
		api.getCompetitions()
			.then((data) => { competitions = data; isLoadingComps = false; })
			.catch(() => { isLoadingComps = false; });
	});

	$effect(() => {
		if (selectedComp) {
			isLoadingEvents = true;
			api.getEvents(selectedComp.Id.toString())
				.then((data) => { events = data; isLoadingEvents = false; })
				.catch(() => { isLoadingEvents = false; });
		}
	});

	const step = $derived<SearchStep>(selectedComp ? "events" : "competitions");

	const filteredCompetitions = $derived.by<CompetitionList[]>(() => {
		if (!competitions.length) return [];
		const sorted = [...competitions].sort((a, b) => b.Date.localeCompare(a.Date));
		if (!query.trim()) return sorted;
		return sorted.filter((comp) =>
			comp.Name.toLowerCase().includes(query.toLowerCase()),
		);
	});

	const filteredEvents = $derived.by<EventData[]>(() => {
		const allEvents = extractEvents(events).sort((a, b) =>
			a.Time.localeCompare(b.Time),
		);
		const eventQuery = query.includes("/")
			? (query.split("/").pop()?.trim() ?? "")
			: "";
		if (!eventQuery) return allEvents;
		return allEvents.filter((evt) =>
			evt.EventName.toLowerCase().includes(eventQuery.toLowerCase()),
		);
	});

	const isLoading = $derived(step === "competitions" ? isLoadingComps : isLoadingEvents);
	const results = $derived(step === "competitions" ? filteredCompetitions : filteredEvents);
	const hasResults = $derived(results.length > 0);
	const showDropdown = $derived(isOpen && (isLoading || hasResults || query.length > 0));

	function handleInputChange(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		query = value;
		if (!isOpen) isOpen = true;
		if (selectedComp && !value.includes("/")) {
			selectedComp = null;
			query = "";
		}
	}

	function handleCompetitionSelect(comp: CompetitionList) {
		triggerHaptic("selection");
		selectedComp = comp;
		query = `${comp.Name} / `;
		inputEl?.focus();
	}

	function handleEventSelect(evt: EventData) {
		if (!selectedComp || navigatingTo !== null) return;
		triggerHaptic("success");
		navigatingTo = evt.Id;
		goto(`/competition/${selectedComp.Id}-${evt.Id}`);
	}

	function handleFocus() {
		isOpen = true;
		isFocused = true;
	}

	function handleBlur() {
		setTimeout(() => {
			isOpen = false;
			isFocused = false;
		}, 150);
	}
</script>

<div class="relative mx-auto w-full max-w-2xl">
	<div class="overflow-visible bg-transparent" role="search">
		<div
			class="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl"
			style="box-shadow: {showDropdown ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : isFocused ? '0 10px 25px -5px rgba(0, 0, 0, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}"
		>
			<div class="relative z-10">
				<div class="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
					<Search class="size-5" />
					<input
						bind:this={inputEl}
						class="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"
						onblur={handleBlur}
						oninput={handleInputChange}
						onfocus={handleFocus}
						placeholder={step === "events" ? "Hae lajeja..." : "Hae kilpailuja nimellä..."}
						type="text"
						value={query}
					/>
					{#if isLoading}
						<Loader2 class="size-5 animate-spin text-primary" />
					{/if}
				</div>
			</div>

			{#if showDropdown}
				<div class="mx-4 h-px bg-linear-to-r from-transparent via-border to-transparent"></div>

				<div class="overflow-hidden">
					<div class="p-2">
						<div class="max-h-80 overflow-y-auto">
							{#if isLoading}
								<div class="flex flex-col items-center gap-3 py-8">
									<div class="relative">
<div class="absolute inset-0 rounded-full bg-primary/20"></div>
						<Loader2 class="relative size-6 animate-spin text-primary" />
									</div>
									<p class="text-muted-foreground text-sm">
										{step === "events" ? "Ladataan lajeja..." : "Ladataan kilpailuja..."}
									</p>
								</div>
							{:else if !hasResults}
								<div class="flex flex-col items-center gap-2 py-8 text-center">
									<div class="rounded-full bg-muted p-3">
										<Search class="size-5 text-muted-foreground" />
									</div>
									<p class="text-muted-foreground text-sm">
										{step === "events" ? "Ei lajeja löytynyt" : "Ei kilpailuja löytynyt"}
									</p>
								</div>
							{:else if step === "competitions"}
								<div class="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-muted-foreground/70 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wider">
									<div class="px-2 pb-2 font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider">
										Kilpailut
									</div>
									{#each filteredCompetitions.slice(0, 10) as comp (comp.Id)}
										<button
											class="group flex w-full cursor-pointer rounded-xl px-2 py-2 text-left transition-colors hover:bg-primary/10 active:bg-primary/15 sm:px-3 sm:py-2.5"
											onmousedown={(e) => e.preventDefault()}
											onclick={() => handleCompetitionSelect(comp)}
										>
											<div class="flex flex-1 items-center justify-between gap-2 sm:gap-3">
												<div class="flex items-center gap-2 sm:gap-3">
													<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground sm:size-9">
														<Calendar class="size-4" />
													</div>
													<div class="flex flex-col">
														<span class="font-medium text-foreground text-sm sm:text-base">{comp.Name}</span>
														<span class="text-muted-foreground text-xs">
															{new Date(comp.Date).toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" })}
														</span>
													</div>
												</div>
												<ArrowRight class="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
											</div>
										</button>
									{/each}
								</div>
							{:else}
								<div class="**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-muted-foreground/70 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wider">
									<div class="px-2 pb-2 font-semibold text-muted-foreground/70 text-xs uppercase tracking-wider">
										Lajit
									</div>
									{#each filteredEvents.slice(0, 15) as evt (evt.Id + evt.Time)}
										{@const isNavigating = navigatingTo === evt.Id}
										{@const isDisabled = navigatingTo !== null && !isNavigating}
										<button
											class="group flex w-full cursor-pointer rounded-xl px-2 py-2 text-left transition-all hover:bg-primary/10 active:bg-primary/15 disabled:pointer-events-none sm:px-3 sm:py-2.5"
											disabled={isDisabled}
											onmousedown={(e) => e.preventDefault()}
											onclick={() => handleEventSelect(evt)}
											style="opacity: {isDisabled ? 0.4 : 1}"
										>
											<div class="flex w-full items-center justify-between gap-2 sm:gap-3">
												<div class="flex items-center gap-2 sm:gap-3">
													<div class="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground sm:size-9">
														{#if isNavigating}
															<Loader2 class="size-4 animate-spin" />
														{:else}
															<Clock class="size-4" />
														{/if}
													</div>
													<div class="flex flex-col">
														<span class="font-medium text-foreground text-sm sm:text-base">{evt.EventName}</span>
														<span class="text-muted-foreground text-xs">{evt.Name}</span>
													</div>
												</div>
												<div class="flex items-center gap-2 sm:gap-3">
													<div class="hidden items-center gap-2 text-muted-foreground text-xs sm:flex">
														<span class="rounded-md bg-muted px-2 py-0.5 font-mono">{evt.Time}</span>
														<span>{evt.Date}</span>
													</div>
													<span class="rounded-md bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs sm:hidden">{evt.Time}</span>
													{#if !isNavigating}
														<ChevronRight class="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
													{/if}
												</div>
											</div>
										</button>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>

	{#if !showDropdown}
		<p class="mt-3 text-center text-muted-foreground/60 text-xs">
			Vinkki: valitse kilpailu ja rajaa laji kirjoittamalla "/"
		</p>
	{/if}
</div>
