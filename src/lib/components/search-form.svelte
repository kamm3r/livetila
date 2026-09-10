<script lang="ts">
  import {
    ArrowRight,
    Calendar,
    ChevronRight,
    Clock,
    LoaderCircle,
    Search,
    X,
  } from "@lucide/svelte";
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy, onMount } from "svelte";
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

  type RecentSearch = { id: string; label: string; url: string };
  const historyKey = "livetila:recent-searches";
  let recentSearches = $state<RecentSearch[]>([]);
  function saveHistory() {
    try {
      localStorage.setItem(historyKey, JSON.stringify(recentSearches));
    } catch {
      /* Storage may be disabled. */
    }
  }
  function rememberSearch(item: RecentSearch) {
    recentSearches = [
      item,
      ...recentSearches.filter((previous) => previous.id !== item.id),
    ].slice(0, 4);
    saveHistory();
  }
  function removeRecent(id: string) {
    recentSearches = recentSearches.filter((item) => item.id !== id);
    saveHistory();
    inputEl?.focus();
  }
  onMount(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(historyKey) ?? "[]",
      );
      if (Array.isArray(saved))
        recentSearches = saved
          .filter(
            (item): item is RecentSearch =>
              item &&
              typeof item.id === "string" &&
              typeof item.label === "string" &&
              typeof item.url === "string" &&
              /^\/competition\/\d+-\d+(\?round=(Qualify|Final))?$/.test(
                item.url,
              ),
          )
          .filter(
            (item, index, all) =>
              all.findIndex((other) => other.id === item.id) === index,
          )
          .slice(0, 4);
    } catch {
      /* Ignore invalid or unavailable history. */
    }
  });

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
  const matchingRecent = $derived(
    selectedComp
      ? []
      : recentSearches.filter((item) =>
          item.label.toLowerCase().includes(query.trim().toLowerCase()),
        ),
  );
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
    isOpen &&
      (isLoading ||
        loadError ||
        hasResults ||
        matchingRecent.length > 0 ||
        query.length > 0),
  );

  let listEl = $state<HTMLElement | null>(null);
  const batchSize = $derived(step === "competitions" ? 10 : 15);
  let visibleCount = $derived.by(() => {
    void query;
    void selectedComp;
    return batchSize;
  });
  const hasMore = $derived(visibleCount < results.length);

  $effect(() => {
    void query;
    void selectedComp;
    if (listEl) listEl.scrollTop = 0;
  });

  function loadMore() {
    visibleCount = Math.min(visibleCount + batchSize, results.length);
  }

  function handleScroll(event: Event) {
    const list = event.currentTarget as HTMLElement;
    if (
      hasMore &&
      list.scrollTop > 0 &&
      list.scrollHeight - list.scrollTop - list.clientHeight < 80
    ) {
      loadMore();
    }
  }

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

  function selectCompetition(comp: CompetitionList) {
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
    const url = `/competition/${selectedComp.Id}-${evt.Id}${round ? `?round=${round}` : ""}`;
    rememberSearch({
      id: url,
      url,
      label: `${selectedComp.Name} / ${evt.EventName} / ${evt.Name}`,
    });
    void goto(url).finally(() => {
      navigatingTo = null;
    });
  }

  let listHeight = $state(320);
  function measureSpace() {
    if (!inputEl) return;
    const viewport = window.visualViewport;
    const bottom =
      (viewport?.height ?? window.innerHeight) + (viewport?.offsetTop ?? 0);
    listHeight = Math.max(
      96,
      Math.min(320, bottom - inputEl.getBoundingClientRect().bottom - 88),
    );
  }
  onMount(() => {
    window.addEventListener("resize", measureSpace);
    window.visualViewport?.addEventListener("resize", measureSpace);
    window.visualViewport?.addEventListener("scroll", measureSpace);
    return () => {
      window.removeEventListener("resize", measureSpace);
      window.visualViewport?.removeEventListener("resize", measureSpace);
      window.visualViewport?.removeEventListener("scroll", measureSpace);
    };
  });

  function handleFocus() {
    measureSpace();
    if (blurTimeout) clearTimeout(blurTimeout);
    isOpen = true;
    isFocused = true;
  }

  function handleBlur(event: FocusEvent) {
    const container = event.currentTarget as HTMLElement;
    if (
      event.relatedTarget instanceof Node &&
      container.contains(event.relatedTarget)
    )
      return;
    blurTimeout = setTimeout(() => {
      isOpen = false;
      isFocused = false;
    }, 150);
  }
</script>

<div class="relative mx-auto h-16 w-full max-w-2xl">
  <Command
    class="absolute inset-x-0 top-0 z-30 h-auto overflow-visible bg-transparent p-0 text-left"
    onkeydown={(event) => {
      if (event.key === "Escape") {
        isOpen = false;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        isOpen = true;
      }
    }}
    role="search"
    shouldFilter={false}
    onfocusin={handleFocus}
    onfocusout={handleBlur}
  >
    <div
      class={cn(
        "relative overflow-hidden rounded-[28px] border bg-card motion-search-surface",
        showDropdown && "shadow-xl shadow-black/10",
        isFocused
          ? "border-primary ring-2 ring-primary/10"
          : "border-border shadow-sm",
      )}
    >
      <div class="relative z-10">
        <div class="flex h-[62px] items-center gap-2 px-5 sm:gap-3">
          <span
            class={cn(
              "inline-flex",
              isFocused && "text-primary",
              !isFocused && "text-muted-foreground",
            )}
          >
            <Search class="size-5" />
          </span>

          <CommandPrimitive.Input
            bind:ref={inputEl}
            onclick={handleFocus}
            class="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:text-base"
            aria-label="Hae kilpailuja tai lajeja"
            placeholder={step === "events"
              ? "Hae lajeja..."
              : "Hae kilpailuja nimellä..."}
            type="text"
            bind:value={() => query, handleInput}
          />

          {#if isLoading}
            <div>
              <LoaderCircle class="size-5 animate-spin text-primary" />
            </div>
          {/if}
        </div>
      </div>

      {#if showDropdown}
        <div class="mx-4 h-px bg-border"></div>
      {/if}

      {#if showDropdown}
        <div class="search-reveal overflow-hidden">
          {#key step}
            <div class="p-2">
              <CommandList
                bind:ref={listEl}
                onscroll={handleScroll}
                class="overflow-y-auto overscroll-contain"
                style={`max-height: ${listHeight}px`}
              >
                {#if matchingRecent.length}
                  {#each matchingRecent as item (item.id)}
                    <div
                      class="recent-row flex items-center rounded-xl pr-2 sm:pr-3"
                    >
                      <CommandItem
                        class="group min-w-0 flex-1 cursor-pointer rounded-xl bg-transparent px-2 py-2 data-selected:bg-transparent sm:px-3 sm:py-2.5"
                        value={`recent-${item.id}`}
                        onSelect={() => {
                          rememberSearch(item);
                          void goto(item.url);
                        }}
                        onmousedown={(event) => event.preventDefault()}
                      >
                        <span
                          class="recent-icon flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9"
                          ><Clock class="size-4" /></span
                        >
                        <span
                          class="min-w-0 break-words font-medium text-foreground text-sm sm:text-base"
                          >{item.label}</span
                        >
                      </CommandItem>
                      <button
                        type="button"
                        class="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-primary"
                        aria-label={`Poista viimeisimmistä hauista: ${item.label}`}
                        onkeydown={(event) => event.stopPropagation()}
                        onclick={() => removeRecent(item.id)}
                        ><X class="size-4" /></button
                      >
                    </div>
                  {/each}
                {/if}
                {#if isLoading}
                  <div class="flex flex-col items-center gap-3 py-8">
                    <div class="relative">
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
                  <div>
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
                  {#each filteredCompetitions.slice(0, visibleCount) as comp (comp.Id)}
                    <div>
                      <CommandItem
                        class="group cursor-pointer rounded-xl px-2 py-2 data-selected:bg-primary/10 active:bg-primary/15 sm:px-3 sm:py-2.5"
                        onmousedown={(e) => {
                          e.preventDefault();
                        }}
                        onSelect={() => selectCompetition(comp)}
                        value={`${comp.Name}-${comp.Id}`}
                      >
                        <div
                          class="flex flex-1 items-center justify-between gap-2 sm:gap-3"
                        >
                          <div class="flex items-center gap-2 sm:gap-3">
                            <div
                              class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-data-selected:bg-primary group-data-selected:text-primary-foreground sm:size-9"
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
                            class="size-4 text-muted-foreground opacity-0 group-data-selected:text-primary group-data-selected:opacity-100"
                          />
                        </div>
                      </CommandItem>
                    </div>
                  {/each}
                {:else if step === "events" && hasResults}
                  <CommandGroup class={groupHeadingClassName} heading="Lajit">
                    {#each filteredEvents.slice(0, visibleCount) as evt (evt.RowId)}
                      {@const isNavigating = navigatingTo === evt.Id}
                      {@const isDisabled =
                        navigatingTo !== null && !isNavigating}
                      <div>
                        <CommandItem
                          class="group cursor-pointer rounded-xl px-2 py-2 data-selected:bg-primary/10 active:bg-primary/15 disabled:pointer-events-none sm:px-3 sm:py-2.5"
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
                                class="relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground group-data-selected:bg-primary group-data-selected:text-primary-foreground sm:size-9"
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
                                <span class="text-muted-foreground text-xs">
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
                                  class="size-4 text-muted-foreground opacity-0 group-data-selected:text-primary group-data-selected:opacity-100"
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
              {#if !isLoading && !loadError && hasResults}
                <div
                  class="mt-1 flex items-center justify-between gap-3 border-t border-border/60 px-2 pt-2 text-xs text-muted-foreground"
                >
                  <span aria-live="polite"
                    >Näytetään {Math.min(visibleCount, results.length)} / {results.length}</span
                  >
                  {#if hasMore}
                    <button
                      type="button"
                      class="rounded-md px-2 py-1.5 font-medium text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      onkeydown={(event) => event.stopPropagation()}
                      onclick={() => {
                        loadMore();
                        if (!hasMore) inputEl?.focus();
                      }}
                    >
                      Näytä lisää
                    </button>
                  {/if}
                </div>
              {/if}
            </div>
          {/key}
        </div>
      {/if}
    </div>
  </Command>
</div>

<style>
  .recent-row:has(:global([data-selected])),
  .recent-row:focus-within {
    background: color-mix(in oklch, var(--primary) 10%, transparent);
  }
  .recent-row:has(:global([data-selected])) .recent-icon,
  .recent-row:focus-within .recent-icon {
    background: var(--primary);
    color: var(--primary-foreground);
  }
</style>
