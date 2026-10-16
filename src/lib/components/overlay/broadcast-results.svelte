<script lang="ts">
  // Final results board, centred on screen like a championship results
  // graphic: medal colours for the top three, each athlete's mark and their
  // gap to the winner. `?accent=5ed6cb` matches a stream's branding.
  import { fly } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import { gapToLeader, isTimed, leadingResult, recordTag } from "$lib/results";
  import AthleteBadge from "$lib/components/athlete-badge.svelte";
  import { athleteBadge } from "$lib/athlete-badge";
  import {
    clubInitials,
    qualification,
    rankOf,
    type OverlayEntry,
    type OverlayView,
  } from "./overlay";

  let {
    view,
    inHeat,
    gaps,
  }: {
    view: OverlayView;
    inHeat: boolean;
    // Overrides `?gap=0`, for previews outside the overlay page.
    gaps?: boolean;
  } = $props();
  const showGaps = $derived(gaps ?? page.url.searchParams.get("gap") !== "0");

  // A board longer than this no longer fits a 720p frame.
  const maxRows = 12;

  const accent = $derived.by(() => {
    const value = page.url.searchParams.get("accent");
    return value && /^[\da-f]{6}$/i.test(value) ? `#${value}` : "#67e8f9";
  });
  const timed = $derived(isTimed(view.eventCategory));
  const leader = $derived(leadingResult(view.entries, view.eventCategory));
  const rows = $derived(view.entries.slice(0, maxRows));
  const motion = $derived(!prefersReducedMotion.current);
  // Names line up only if every row keeps a code column once one has it.
  const hasCodes = $derived(rows.some((entry) => affiliation(entry).code));

  // Rows slide in one after another once the board is on screen.
  let shown = $state(false);
  $effect(() => {
    shown = true;
  });

  const medal = ["bg-[#d9ad4b]", "bg-[#c9cdd1]", "bg-[#c4834f]"];

  // Field marks and gaps get a unit; times and statuses are shown as is.
  const unit = (value?: string | null) =>
    !timed && value && /\d[.,]\d+$/.test(value) ? "m" : "";

  function gap(entry: OverlayEntry) {
    const value = gapToLeader(entry.Result, leader, view.eventCategory);
    return value === "—" ? null : value;
  }

  // Foreign athletes carry their country code, Finnish ones their club.
  function affiliation(entry: OverlayEntry) {
    const badge = athleteBadge(entry);
    if (badge?.kind === "flag")
      return {
        code: entry.Athletes?.[0]?.Nationality?.trim().toUpperCase(),
        club: null,
      };
    return {
      code: null,
      club:
        entry.Organization?.Name ??
        entry.Athletes?.[0]?.Organization?.Name ??
        null,
    };
  }
</script>

{#snippet mark(value: string | null | undefined)}
  {value ?? ""}{#if unit(value)}<span class="normal-case">{unit(value)}</span
    >{/if}
{/snippet}

<div class="flex min-h-full items-center justify-center p-8">
  {#if shown}
    <div
      class="w-[40rem] font-semibold text-white tracking-tight"
      style:--accent={accent}
    >
      <header in:fly|global={{ y: -12, duration: motion ? 300 : 0 }}>
        <div
          class="w-fit border-(--accent) border-t-2 bg-neutral-950/90 px-3 py-0.5 text-(--accent) text-sm uppercase"
        >
          Tulokset{view.roundName ? ` – ${view.roundName}` : ""}{view.heatLabel
            ? ` · ${view.heatLabel}`
            : ""}
        </div>
        <div class="flex items-stretch">
          <h2
            class="min-w-0 flex-1 truncate bg-(--accent) px-3 py-1 text-black text-xl uppercase"
          >
            {view.eventName ?? ""}
          </h2>
          <span
            class="flex w-24 items-center justify-end bg-neutral-950/90 px-3 text-[11px] text-neutral-300 uppercase"
          >
            {timed ? "Aika" : "Tulos"}
          </span>
          {#if showGaps}
            <span
              class="flex w-20 items-center justify-end bg-neutral-950/90 px-3 text-[11px] text-neutral-300 uppercase"
            >
              Ero
            </span>
          {/if}
        </div>
      </header>

      <!-- Each row carries its own divider, so the board builds up with its
           rows instead of showing an empty background first. -->
      <ol class="flex flex-col">
        {#each rows as entry, index (entry.Id)}
          {@const rank = rankOf(entry, index, inHeat)}
          {@const podium = rank !== null && rank <= 3 ? medal[rank - 1] : null}
          {@const tag = recordTag(entry, view.eventCategory)}
          {@const q = qualification(entry)}
          {@const from = affiliation(entry)}
          {@const behind = gap(entry)}
          <li
            in:fly|global={{
              x: -24,
              duration: motion ? 300 : 0,
              delay: motion ? 150 + index * 50 : 0,
            }}
            class={cn(
              "flex h-8.5 items-stretch border-neutral-950/90 border-b-2 bg-neutral-800/90",
              podium && `${podium} text-black`,
            )}
          >
            <span
              class="flex w-10 shrink-0 items-center justify-center tabular-nums"
              >{rank ?? ""}</span
            >
            <span class="flex w-8 shrink-0 items-center justify-center">
              {#if athleteBadge(entry)}
                <AthleteBadge {entry} />
              {:else if clubInitials(entry)}
                <span
                  class="flex h-5 w-6 items-center justify-center rounded-sm bg-white text-[9px] text-neutral-700"
                  >{clubInitials(entry)}</span
                >
              {/if}
            </span>
            {#if hasCodes}
              <span class="flex w-11 shrink-0 items-center pl-1">
                {from.code ?? ""}
              </span>
            {/if}
            <span class="flex min-w-0 flex-1 items-center gap-2 pl-2">
              <span class="truncate">
                {#if entry.Surname}
                  {entry.Firstname}
                  <span class="uppercase">{entry.Surname}</span>
                {:else}
                  {entry.Name}
                {/if}
              </span>
              {#if from.club}
                <span
                  class={cn(
                    "truncate font-normal text-xs",
                    podium ? "text-black/60" : "text-neutral-400",
                  )}>{from.club}</span
                >
              {/if}
              <span class="ml-auto flex shrink-0 gap-1 pr-2 text-[11px]">
                {#if tag}
                  <span class="bg-(--accent) px-1.5 text-black">{tag}</span>
                {/if}
                {#if q}
                  <span class="bg-(--accent) px-1.5 text-black">{q}</span>
                {/if}
              </span>
            </span>
            <span
              class={cn(
                "flex w-24 shrink-0 items-center justify-end px-3 tabular-nums",
                podium ? "bg-black/10" : "bg-white/5",
              )}
            >
              {@render mark(entry.Result)}
            </span>
            {#if showGaps}
              <span
                class={cn(
                  "flex w-20 shrink-0 items-center justify-end px-3 text-sm tabular-nums",
                  podium ? "text-black/70" : "text-(--accent)",
                )}
              >
                {#if behind}{@render mark(behind)}{/if}
              </span>
            {/if}
          </li>
        {/each}
      </ol>

      <footer
        in:fly|global={{
          y: 12,
          duration: motion ? 300 : 0,
          delay: motion ? 150 + rows.length * 50 : 0,
        }}
        class="border-(--accent) border-t-2"
      >
        <span
          class="inline-block bg-neutral-950/90 px-3 py-0.5 text-(--accent) text-sm uppercase"
        >
          {view.competitionName ?? ""}
        </span>
        {#if view.isRefreshError}
          <span
            role="status"
            class="ml-2 bg-neutral-950/90 px-2 py-0.5 text-neutral-300 text-xs"
          >
            Päivitys viivästyy
          </span>
        {/if}
      </footer>
    </div>
  {/if}
</div>
