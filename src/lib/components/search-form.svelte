<script lang="ts">
  import { fly, fade, slide, scale } from "svelte/transition";
  import { cubicOut, cubicInOut } from "svelte/easing";
  import {
    ArrowRight,
    Calendar,
    ChevronRight,
    Clock,
    LoaderCircle,
    Search,
  } from "@lucide/svelte";
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { Command as CommandPrimitive } from "bits-ui";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api";
  import type { CompetitionList, Events } from "~/types/comp";

  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
  } from "$lib/components/ui/command";
  import { cn } from "$lib/utils.js";

  type EventData = {
    Id: number;
    RowId: number;
    StartsAt: string;
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
            RowId: event.Id,
            StartsAt: event.BeginDateTimeWithTZ,
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

  const groupHeadingClassName =
    "**:data-[command-group-heading]:px-2 **:data-[command-group-heading]:pb-2 **:data-[command-group-heading]:font-semibold **:data-[command-group-heading]:text-muted-foreground/70 **:data-[command-group-heading]:text-xs **:data-[command-group-heading]:uppercase **:data-[command-group-heading]:tracking-wider";

  let query = $state("");
  let isOpen = $state(false);
  let isFocused = $state(false);
  let selectedComp = $state<CompetitionList | null>(null);
  let navigatingTo = $state<number | null>(null);

  let inputEl = $state<HTMLInputElement | null>(null);
  let blurTimeout: ReturnType<typeof setTimeout> | undefined =
    $state(undefined);

  const competitionsQuery = createQuery(() => ({
    queryKey: ["competitions"],
    queryFn: () => api.getCompetitions(),
  }));
  const eventsQuery = createQuery(() => ({
    queryKey: ["events", selectedComp?.Id.toString()],
    queryFn: () => api.getEvents(selectedComp!.Id.toString()),
    enabled: selectedComp !== null,
  }));
  const competitions = $derived(competitionsQuery.data ?? []);
  const events = $derived(eventsQuery.data ?? {});
  const isLoadingComps = $derived(competitionsQuery.isPending);
  const isLoadingEvents = $derived(eventsQuery.isPending);
  const loadError = $derived(
    selectedComp ? eventsQuery.isError : competitionsQuery.isError,
  );

  const step = $derived<SearchStep>(selectedComp ? "events" : "competitions");

  const filteredCompetitions = $derived.by<CompetitionList[]>(() => {
    if (!competitions.length) return [];
    const sorted = [...competitions].sort((a, b) =>
      b.Date.localeCompare(a.Date),
    );
    if (!query.trim()) return sorted;
    return sorted.filter((comp) =>
      comp.Name.toLowerCase().includes(query.toLowerCase()),
    );
  });

  const filteredEvents = $derived.by<EventData[]>(() => {
    if (!events) return [];
    const allEvents = extractEvents(events).sort((a, b) =>
      a.StartsAt.localeCompare(b.StartsAt),
    );
    const eventQuery = query.includes("/")
      ? (query.split("/").pop()?.trim() ?? "")
      : "";
    if (!eventQuery) return allEvents;
    return allEvents.filter((evt) =>
      evt.EventName.toLowerCase().includes(eventQuery.toLowerCase()),
    );
  });

  const isLoading = $derived(
    step === "competitions" ? isLoadingComps : isLoadingEvents,
  );
  const results = $derived(
    step === "competitions" ? filteredCompetitions : filteredEvents,
  );
  const hasResults = $derived(results.length > 0);
  const showDropdown = $derived(
    isOpen && (isLoading || loadError || hasResults || query.length > 0),
  );

  function handleInput(value: string) {
    query = value;
    if (!isOpen) isOpen = true;
    if (selectedComp && !value.includes("/")) {
      selectedComp = null;
      query = "";
    }
  }

  const { trigger, destroy } = createWebHaptics();
  onDestroy(() => {
    destroy();
    if (blurTimeout) clearTimeout(blurTimeout);
  });

  function handleCompetitionSelect(comp: CompetitionList) {
    trigger();
    selectedComp = comp;
    query = `${comp.Name} / `;
    inputEl?.focus();
  }

  function handleEventSelect(evt: EventData) {
    if (!selectedComp || navigatingTo !== null) return;
    trigger();
    navigatingTo = evt.Id;
    const round =
      evt.Name === "Alkuerät"
        ? "Qualify"
        : evt.Name === "Loppukilpailu"
          ? "Final"
          : null;
    void goto(
      `/competition/${selectedComp.Id}-${evt.Id}${round ? `?round=${round}` : ""}`,
    ).finally(() => {
      navigatingTo = null;
    });
  }

  function handleFocus() {
    if (blurTimeout) clearTimeout(blurTimeout);
    isOpen = true;
    isFocused = true;
  }

  function handleBlur() {
    blurTimeout = setTimeout(() => {
      isOpen = false;
      isFocused = false;
    }, 150);
  }
</script>

<div class="relative mx-auto w-full max-w-2xl">
  <Command
    class="overflow-visible bg-transparent"
    role="search"
    shouldFilter={false}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl transition-all duration-300 ease-out",
        isFocused && "focused",
      )}
      style="box-shadow: {showDropdown
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        : isFocused
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}"
    >
      <div
        class={cn(
          "pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300",
          isFocused ? "opacity-100" : "opacity-0",
        )}
        style="background: linear-gradient(135deg, rgba(113, 180, 255, 0.15) 0%, rgba(113, 180, 255, 0.05) 50%, rgba(113, 180, 255, 0.15) 100%)"
      ></div>

      <div class="relative z-10">
        <div
          class="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5"
        >
          <span
            class={cn(
              "inline-flex transition-all duration-300 ease-out",
              isFocused && "scale-110 text-primary",
              !isFocused && "text-muted-foreground",
            )}
          >
            <Search class="size-5" />
          </span>

          <CommandPrimitive.Input
            bind:ref={inputEl}
            class="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"
            onblur={handleBlur}
            aria-label="Hae kilpailuja tai lajeja"
            onfocus={handleFocus}
            placeholder={step === "events"
              ? "Hae lajeja..."
              : "Hae kilpailuja nimellä..."}
            type="text"
            bind:value={() => query, handleInput}
          />

          {#if isLoading}
            <div
              in:scale={{ duration: 150, start: 0.8 }}
              out:scale={{ duration: 150, start: 0.8 }}
            >
              <LoaderCircle class="size-5 animate-spin text-primary" />
            </div>
          {/if}
        </div>
      </div>

      {#if showDropdown}
        <div
          in:scale={{ duration: 200, start: 0 }}
          out:scale={{ duration: 200, start: 0 }}
          class="mx-4 h-px bg-linear-to-r from-transparent via-border to-transparent"
        ></div>
      {/if}

      {#key step}
        {#if showDropdown}
          <div
            in:slide={{ duration: 200, easing: cubicOut }}
            out:slide={{ duration: 200, easing: cubicInOut }}
            class="overflow-hidden"
          >
            <div class="p-2">
              <CommandList class="max-h-80 overflow-y-auto">
                {#if isLoading}
                  <div
                    in:fade={{ duration: 150 }}
                    class="flex flex-col items-center gap-3 py-8"
                  >
                    <div class="relative">
                      <div
                        class="absolute inset-0 animate-ping rounded-full bg-primary/20"
                      ></div>
                      <LoaderCircle
                        class="relative size-6 animate-spin text-primary"
                      />
                    </div>
                    <p class="text-muted-foreground text-sm">
                      {step === "events"
                        ? "Ladataan lajeja..."
                        : "Ladataan kilpailuja..."}
                    </p>
                  </div>
                {:else if loadError}
                  <div role="alert" class="py-8 text-center text-sm">
                    <p>Tietojen lataaminen epäonnistui.</p>
                    <button
                      class="mt-2 text-primary underline"
                      onclick={() =>
                        selectedComp
                          ? eventsQuery.refetch()
                          : competitionsQuery.refetch()}>Yritä uudelleen</button
                    >
                  </div>
                {:else if !hasResults}
                  <div in:fly={{ y: 10, duration: 200 }}>
                    <CommandEmpty
                      class="flex flex-col items-center gap-2 py-8 text-center"
                    >
                      <div class="rounded-full bg-muted p-3">
                        <Search class="size-5 text-muted-foreground" />
                      </div>
                      <p class="text-muted-foreground text-sm">
                        {step === "events"
                          ? "Ei lajeja löytynyt"
                          : "Ei kilpailuja löytynyt"}
                      </p>
                    </CommandEmpty>
                  </div>
                {:else if step === "competitions" && hasResults}
                  <CommandGroup
                    class={groupHeadingClassName}
                    heading="Kilpailut"
                  >
                    {#each filteredCompetitions.slice(0, 10) as comp, i (comp.Id)}
                      <div
                        in:fly={{ y: 8, duration: 250, delay: i * 35 }}
                        out:fly={{ y: -4, duration: 150 }}
                        class="active-press"
                      >
                        <CommandItem
                          class="group cursor-pointer rounded-xl px-2 py-2 transition-colors data-selected:bg-primary/10 active:bg-primary/15 sm:px-3 sm:py-2.5"
                          onmousedown={(e) => {
                            e.preventDefault();
                          }}
                          onSelect={() => handleCompetitionSelect(comp)}
                          value={`${comp.Name}-${comp.Id}`}
                        >
                          <div
                            class="flex flex-1 items-center justify-between gap-2 sm:gap-3"
                          >
                            <div class="flex items-center gap-2 sm:gap-3">
                              <div
                                class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-data-selected:bg-primary group-data-selected:text-primary-foreground sm:size-9"
                              >
                                <Calendar class="size-4" />
                              </div>
                              <div class="flex flex-col">
                                <span
                                  class="font-medium text-foreground text-sm sm:text-base"
                                  >{comp.Name}</span
                                >
                                <span class="text-muted-foreground text-xs">
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
                            <ArrowRight
                              class="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-data-selected:translate-x-0.5 group-data-selected:text-primary group-data-selected:opacity-100"
                            />
                          </div>
                        </CommandItem>
                      </div>
                    {/each}
                  </CommandGroup>
                {:else if step === "events" && hasResults}
                  <CommandGroup class={groupHeadingClassName} heading="Lajit">
                    {#each filteredEvents.slice(0, 15) as evt, i (evt.RowId)}
                      {@const isNavigating = navigatingTo === evt.Id}
                      {@const isDisabled =
                        navigatingTo !== null && !isNavigating}
                      <div
                        in:fly={{ y: 8, duration: 250, delay: i * 35 }}
                        out:fly={{ y: -4, duration: 150 }}
                      >
                        <CommandItem
                          class="group cursor-pointer rounded-xl px-2 py-2 transition-all data-selected:bg-primary/10 active:bg-primary/15 disabled:pointer-events-none sm:px-3 sm:py-2.5"
                          disabled={isDisabled}
                          onmousedown={(e) => {
                            e.preventDefault();
                            handleEventSelect(evt);
                          }}
                          onSelect={() => handleEventSelect(evt)}
                          style="opacity: {isDisabled ? 0.4 : 1}"
                          value={`${evt.EventName}-${evt.RowId}`}
                        >
                          <div
                            class="flex w-full items-center justify-between gap-2 sm:gap-3"
                          >
                            <div class="flex items-center gap-2 sm:gap-3">
                              <div
                                class="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-data-selected:bg-primary group-data-selected:text-primary-foreground sm:size-9"
                              >
                                {#if isNavigating}
                                  <LoaderCircle class="size-4 animate-spin" />
                                {:else}
                                  <Clock class="size-4" />
                                {/if}
                              </div>
                              <div class="flex flex-col">
                                <span
                                  class="font-medium text-foreground text-sm sm:text-base"
                                  >{evt.EventName}</span
                                >
                                <span
                                  in:fly={{ y: 4, duration: 150, delay: 50 }}
                                  out:fly={{ y: -4, duration: 150 }}
                                  class="text-muted-foreground text-xs"
                                >
                                  {isNavigating ? "Siirrytään..." : evt.Name}
                                </span>
                              </div>
                            </div>
                            <div class="flex items-center gap-2 sm:gap-3">
                              <div
                                class="hidden items-center gap-2 text-muted-foreground text-xs sm:flex"
                              >
                                <span
                                  class="rounded-md bg-muted px-2 py-0.5 font-mono"
                                  >{evt.Time}</span
                                >
                                <span>{evt.Date}</span>
                              </div>
                              <span
                                class="rounded-md bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xs sm:hidden"
                                >{evt.Time}</span
                              >
                              {#if isNavigating}
                                <div class="size-4"></div>
                              {:else}
                                <ChevronRight
                                  class="size-4 text-muted-foreground opacity-0 transition-all duration-200 group-data-selected:translate-x-0.5 group-data-selected:text-primary group-data-selected:opacity-100"
                                />
                              {/if}
                            </div>
                          </div>
                        </CommandItem>
                      </div>
                    {/each}
                  </CommandGroup>
                {/if}
              </CommandList>
            </div>
          </div>
        {/if}
      {/key}
    </div>
  </Command>

  {#if !showDropdown}
    <p
      in:fly={{ y: 5, duration: 200, delay: 100 }}
      out:fly={{ y: -5, duration: 150 }}
      class="mt-3 text-center text-muted-foreground/60 text-xs"
    >
      Vinkki: valitse kilpailu ja rajaa laji kirjoittamalla "/"
    </p>
  {/if}
</div>

<style>
  .focused {
    scale: 1.01;
  }
  .active-press:active {
    scale: 0.97;
  }
</style>
