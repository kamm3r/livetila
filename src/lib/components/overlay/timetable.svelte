<script lang="ts">
  // Timetable board, centred on screen like a championship schedule graphic:
  // every event of the competition in pages of ten, one day per page, with
  // the one in progress marked. It opens on the page with the current or next
  // event and turns the page every ten seconds. `?accent=5ed6cb` matches a
  // stream's branding.
  import { fade, fly } from "svelte/transition";
  import { prefersReducedMotion } from "svelte/motion";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";
  import type { EventWithDate } from "$lib/events";

  let {
    events,
    competitionName,
  }: { events: EventWithDate[]; competitionName?: string } = $props();

  // A board longer than this no longer fits a 720p frame.
  const maxRows = 10;
  const pageFor = 10_000;

  const accent = $derived.by(() => {
    const value = page.url.searchParams.get("accent");
    return value && /^[\da-f]{6}$/i.test(value) ? `#${value}` : "#67e8f9";
  });
  const motion = $derived(!prefersReducedMotion.current);

  const dayKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const timed = $derived(
    events
      .map((event) => ({ event, start: new Date(event.BeginDateTimeWithTZ) }))
      .filter(({ start }) => !Number.isNaN(start.getTime()))
      .sort((a, b) => a.start.getTime() - b.start.getTime()),
  );

  // Pages of ten that never mix days, so the date above always fits.
  const pages = $derived.by(() => {
    const days = new Map<string, typeof timed>();
    for (const row of timed) {
      const key = dayKey(row.start);
      days.set(key, [...(days.get(key) ?? []), row]);
    }
    return [...days.values()].flatMap((rows) =>
      Array.from({ length: Math.ceil(rows.length / maxRows) }, (_, i) =>
        rows.slice(i * maxRows, (i + 1) * maxRows),
      ),
    );
  });
  const pageCount = $derived(pages.length);

  // The page with the event in progress or next up; the last once all are done.
  const startPage = $derived.by(() => {
    const index = pages.findIndex((rows) =>
      rows.some(({ event }) => event.Status !== "Official"),
    );
    return index >= 0 ? index : pageCount - 1;
  });
  let turned = $state<number | null>(null);
  const current = $derived(
    pageCount > 0 ? (turned ?? startPage) % pageCount : 0,
  );
  $effect(() => {
    if (pageCount <= 1) return;
    const timer = setInterval(
      () => (turned = (current + 1) % pageCount),
      pageFor,
    );
    return () => clearInterval(timer);
  });

  const rows = $derived(pages[current] ?? []);

  const dateLabel = $derived.by(() => {
    const start = rows[0]?.start;
    if (!start) return "";
    const label = start.toLocaleDateString("fi-FI", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  const time = (start: Date) =>
    start.toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" });

  // Rows slide in one after another once the board is on screen.
  let shown = $state(false);
  $effect(() => {
    shown = true;
  });
</script>

<div class="flex min-h-full items-center justify-center p-8">
  {#if shown && rows.length > 0}
    <div
      class="w-[40rem] font-semibold text-white tracking-tight"
      style:--accent={accent}
    >
      <header in:fly|global={{ y: -12, duration: motion ? 300 : 0 }}>
        <div
          class="w-fit border-(--accent) border-t-2 bg-neutral-950/90 px-3 py-0.5 text-(--accent) text-sm"
        >
          {dateLabel}
        </div>
        <div class="flex items-center bg-(--accent) px-3 py-1 text-black">
          <h2 class="flex-1 text-xl uppercase">Aikataulu</h2>
          {#if pageCount > 1}
            <span
              class="flex gap-1.5"
              aria-label="Sivu {current + 1}/{pageCount}"
            >
              {#each pages as _, i (i)}
                <span
                  class={cn(
                    "size-2 rounded-full bg-black/25 transition-colors duration-300",
                    i === current && "bg-black",
                  )}
                ></span>
              {/each}
            </span>
          {/if}
        </div>
      </header>

      <!-- With several pages the board keeps the height of a full page, so
           a short page never moves the header. -->
      <div
        style:min-height={pageCount > 1
          ? `calc(${maxRows} * 2.125rem + 2rem)`
          : undefined}
      >
        <!-- Pages share one cell: the old one fades while the new one's rows
             slide in, without the board jumping. Each row carries its own
             divider, so the board builds up with its rows. -->
        <div class="grid">
          {#key current}
            <ol
              class="col-start-1 row-start-1 flex flex-col"
              out:fade={{ duration: motion ? 150 : 0 }}
            >
              {#each rows as { event, start }, index (event.Id)}
                {@const live = event.Status === "Progress"}
                <li
                  in:fly|global={{
                    x: -24,
                    duration: motion ? 300 : 0,
                    delay: motion ? 150 + index * 50 : 0,
                  }}
                  class="flex h-8.5 items-center gap-3 border-neutral-950/90 border-b-2 bg-neutral-800/90 px-3 text-white"
                >
                  <span class="w-12 shrink-0 tabular-nums">{time(start)}</span>
                  <span
                    class="w-32 shrink-0 truncate text-(--accent) text-sm uppercase"
                    >{event.Name}</span
                  >
                  <span class="min-w-0 flex-1 truncate uppercase"
                    >{event.EventName}</span
                  >
                  {#if live}
                    <span
                      class="flex shrink-0 items-center gap-1.5 text-red-400 text-xs uppercase"
                    >
                      <span class="size-1.5 rounded-full bg-red-500"></span>
                      Live
                    </span>
                  {/if}
                </li>
              {/each}
            </ol>
          {/key}
        </div>

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
            {competitionName ?? ""}
          </span>
        </footer>
      </div>
    </div>
  {/if}
</div>
