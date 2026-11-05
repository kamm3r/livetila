<script lang="ts">
  import { ChevronRight, Clock, LoaderCircle, Search, X } from "@lucide/svelte";
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Command as CommandPrimitive } from "bits-ui";
  import {
    SearchWorkflow,
    type SearchEvent,
  } from "$lib/search-workflow.svelte";
  import type { CompetitionList } from "~/types/comp";

  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
  } from "$lib/components/ui/command";
  import { cn } from "$lib/utils.js";

  // A page may own the workflow to drive the search from outside the field.
  let { search = new SearchWorkflow(goto) }: { search?: SearchWorkflow } =
    $props();
  onMount(() => {
    try {
      search.restoreHistory(window.localStorage);
    } catch {
      /* Storage access may be disabled. */
    }
  });

  function removeRecent(id: string) {
    search.removeRecent(id);
    inputEl?.focus();
  }

  const multipleEventDates = $derived(
    new Set(search.filteredEvents.map((event) => event.Date)).size > 1,
  );

  let isOpen = $state(false);
  let isFocused = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);
  export function focus() {
    inputEl?.focus();
  }
  let listEl = $state<HTMLElement | null>(null);
  let blurTimeout: ReturnType<typeof setTimeout> | undefined =
    $state(undefined);
  const showDropdown = $derived(
    isOpen &&
      (search.isLoading ||
        search.loadError ||
        search.hasResults ||
        search.matchingRecent.length > 0 ||
        search.query.length > 0),
  );
  $effect(() => {
    void search.query;
    void search.selectedComp;
    if (listEl) listEl.scrollTop = 0;
  });
  // The list fades at the bottom only while there is more to scroll to.
  let moreBelow = $state(false);
  function updateMoreBelow() {
    if (!listEl) return;
    moreBelow =
      listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight > 1;
  }
  $effect(() => {
    void search.results.length;
    void search.visibleCount;
    void search.isLoading;
    void listHeight;
    if (!listEl) return;
    const frame = requestAnimationFrame(updateMoreBelow);
    return () => cancelAnimationFrame(frame);
  });
  function handleScroll(event: Event) {
    updateMoreBelow();
    const list = event.currentTarget as HTMLElement;
    if (
      search.hasMore &&
      list.scrollTop > 0 &&
      list.scrollHeight - list.scrollTop - list.clientHeight < 80
    )
      search.loadMore();
  }
  function handleInput(value: string) {
    search.input(value);
    isOpen = true;
  }
  const { trigger, destroy } = createWebHaptics();
  onDestroy(() => {
    destroy();
    if (blurTimeout) clearTimeout(blurTimeout);
  });
  function selectCompetition(comp: CompetitionList) {
    trigger();
    search.selectCompetition(comp);
    inputEl?.focus();
  }
  function handleEventSelect(event: SearchEvent) {
    if (search.navigatingTo !== null) return;
    trigger();
    void search.selectEvent(event);
  }

  let listHeight = $state(420);
  function measureSpace() {
    if (!inputEl) return;
    const viewport = window.visualViewport;
    const bottom =
      (viewport?.height ?? window.innerHeight) + (viewport?.offsetTop ?? 0);
    listHeight = Math.max(
      96,
      Math.min(420, bottom - inputEl.getBoundingClientRect().bottom - 88),
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

  // Opening can move the field on a phone, so measure once it has settled.
  $effect(() => {
    if (!showDropdown) return;
    const frame = requestAnimationFrame(measureSpace);
    return () => cancelAnimationFrame(frame);
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

<div
  class="relative mx-auto h-14 w-full max-w-2xl"
  data-search-open={showDropdown ? "" : undefined}
>
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
        "relative overflow-hidden rounded-2xl border bg-card motion-search-surface",
        showDropdown && "shadow-lg shadow-black/8 dark:shadow-black/30",
        isFocused
          ? "border-primary/60 ring-2 ring-primary/12"
          : "border-input shadow-xs",
      )}
    >
      <div class="relative z-10">
        <div class="flex h-[54px] items-center gap-2.5 px-4">
          <span
            class={cn(
              "inline-flex",
              isFocused && "text-primary",
              !isFocused && "text-muted-foreground",
            )}
          >
            <Search class="size-[18px]" />
          </span>

          <CommandPrimitive.Input
            bind:ref={inputEl}
            onclick={handleFocus}
            class="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-base"
            aria-label="Hae kilpailuja tai lajeja"
            placeholder={search.step === "events"
              ? "Hae lajeja..."
              : "Hae kilpailuja nimellä..."}
            type="text"
            bind:value={() => search.query, handleInput}
          />

          {#if search.isLoading}
            <div>
              <LoaderCircle class="size-5 animate-spin text-primary" />
            </div>
          {/if}
        </div>
      </div>

      {#if showDropdown}
        <div class="h-px bg-border"></div>
      {/if}

      {#if showDropdown}
        <div class="search-reveal overflow-hidden">
          {#key search.step}
            <div class="p-2">
              <CommandList
                bind:ref={listEl}
                onscroll={handleScroll}
                class={cn(
                  "overflow-y-auto overscroll-contain",
                  moreBelow && "search-fade",
                )}
                style={`max-height: ${listHeight}px`}
              >
                {#if search.matchingRecent.length}
                  {#each search.matchingRecent as item (item.id)}
                    <div class="recent-row flex items-center rounded-lg pr-1">
                      <CommandItem
                        class="group min-w-0 flex-1 cursor-pointer rounded-lg bg-transparent px-2.5 py-2 data-selected:bg-transparent [&>.cn-command-item-indicator]:hidden"
                        value={`recent-${item.id}`}
                        onSelect={() => {
                          void search.selectRecent(item);
                        }}
                        onmousedown={(event) => event.preventDefault()}
                      >
                        <Clock
                          class="recent-icon size-4 shrink-0 text-muted-foreground"
                        />
                        <span
                          class="min-w-0 break-words font-medium text-foreground text-sm"
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
                {#if search.isLoading}
                  <div class="flex flex-col items-center gap-3 py-8">
                    <div class="relative">
                      <LoaderCircle
                        class="relative size-6 animate-spin text-primary"
                      />
                    </div>
                    <p class="text-muted-foreground text-sm">
                      {search.step === "events"
                        ? "Ladataan lajeja..."
                        : "Ladataan kilpailuja..."}
                    </p>
                  </div>
                {:else if search.loadError}
                  <div role="alert" class="py-8 text-center text-sm">
                    <p>Tietojen lataaminen epäonnistui.</p>
                    <button
                      class="mt-2 text-primary underline"
                      onclick={() => search.retry()}>Yritä uudelleen</button
                    >
                  </div>
                {:else if !search.hasResults}
                  <div>
                    <CommandEmpty
                      class="flex flex-col items-center gap-2 py-8 text-center"
                    >
                      <div class="rounded-full bg-muted p-3">
                        <Search class="size-5 text-muted-foreground" />
                      </div>
                      <p class="text-muted-foreground text-sm">
                        {search.step === "events"
                          ? "Ei lajeja löytynyt"
                          : "Ei kilpailuja löytynyt"}
                      </p>
                    </CommandEmpty>
                  </div>
                {:else if search.step === "competitions" && search.hasResults}
                  {#each search.filteredCompetitions.slice(0, search.visibleCount) as comp (comp.Id)}
                    <div>
                      <CommandItem
                        class="group cursor-pointer rounded-lg px-2.5 py-2 data-selected:bg-primary/10 active:bg-primary/15 [&>.cn-command-item-indicator]:hidden"
                        onmousedown={(e) => {
                          e.preventDefault();
                        }}
                        onSelect={() => selectCompetition(comp)}
                        value={`${comp.Name}-${comp.Id}`}
                      >
                        <div
                          class="flex min-w-0 flex-1 items-center justify-between gap-3"
                        >
                          <div class="flex min-w-0 flex-col gap-0.5">
                            <span
                              class="truncate font-medium text-foreground text-sm"
                              >{comp.Name}</span
                            >
                            <span
                              class="truncate text-muted-foreground text-xs tabular-nums"
                            >
                              {[
                                new Date(comp.Date).toLocaleDateString("fi-FI"),
                                comp.Stadion?.Name,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </div>
                          <ChevronRight
                            class="size-4 shrink-0 text-primary opacity-0 group-data-selected:opacity-100"
                          />
                        </div>
                      </CommandItem>
                    </div>
                  {/each}
                {:else if search.step === "events" && search.hasResults}
                  <CommandGroup class="p-0">
                    {#each search.filteredEvents.slice(0, search.visibleCount) as evt (evt.Id)}
                      {@const isNavigating = search.navigatingTo === evt.Id}
                      {@const isDisabled =
                        search.navigatingTo !== null && !isNavigating}
                      <div>
                        <CommandItem
                          class="group cursor-pointer rounded-lg px-2.5 py-2 data-selected:bg-primary/10 active:bg-primary/15 [&>.cn-command-item-indicator]:hidden disabled:pointer-events-none"
                          disabled={isDisabled}
                          onmousedown={(e) => {
                            e.preventDefault();
                            handleEventSelect(evt);
                          }}
                          onSelect={() => handleEventSelect(evt)}
                          style="opacity: {isDisabled ? 0.4 : 1}"
                          value={`${evt.EventName}-${evt.Id}`}
                        >
                          <div
                            class="grid w-full grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-2"
                          >
                            <span
                              class="text-[13px] text-muted-foreground tabular-nums"
                              >{evt.Time}</span
                            >
                            <div class="flex min-w-0 flex-col gap-0.5">
                              <span
                                class="truncate font-medium text-foreground text-sm"
                                >{evt.EventName}</span
                              >
                              <span
                                class="truncate text-muted-foreground text-xs"
                              >
                                {isNavigating ? "Siirrytään..." : evt.Name}
                              </span>
                            </div>
                            <div
                              class="flex items-center gap-2 text-muted-foreground text-xs tabular-nums"
                            >
                              {#if multipleEventDates}<span
                                  class="max-sm:hidden">{evt.Date}</span
                                >{/if}
                              {#if isNavigating}
                                <LoaderCircle
                                  class="size-4 animate-spin text-primary"
                                />
                              {:else}
                                <ChevronRight
                                  class="size-4 text-primary opacity-0 group-data-selected:opacity-100"
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
              {#if !search.isLoading && !search.loadError && search.hasMore}
                <div
                  class="-mx-2 -mb-2 flex items-center justify-between gap-3 border-t px-[1.125rem] py-2 text-xs text-muted-foreground"
                >
                  <span aria-live="polite"
                    >Näytetään {Math.min(
                      search.visibleCount,
                      search.results.length,
                    )} / {search.results.length}</span
                  >
                  <button
                    type="button"
                    class="rounded-md px-2 py-1.5 font-medium text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onkeydown={(event) => event.stopPropagation()}
                    onclick={() => {
                      search.loadMore();
                      if (!search.hasMore) inputEl?.focus();
                    }}
                  >
                    Näytä lisää
                  </button>
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
  /* Rows fade out at the bottom edge: a hint there is more to scroll to. */
  :global(.search-fade) {
    mask-image: linear-gradient(
      to bottom,
      black calc(100% - 2.5rem),
      transparent
    );
  }
  .recent-row:has(:global([data-selected])),
  .recent-row:focus-within {
    background: color-mix(in oklch, var(--primary) 10%, transparent);
  }
</style>
