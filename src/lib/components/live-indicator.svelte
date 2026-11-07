<script lang="ts">
  // Only show a refresh warning once the retained data is old enough.
  const staleAfter = 10_000;
  const timeFormatter = new Intl.DateTimeFormat("fi-FI", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let {
    live,
    failingSince,
  }: {
    live: boolean;
    failingSince: number | null;
  } = $props();

  let now = $state(Date.now());
  $effect(() => {
    if (failingSince === null) return;
    now = Date.now();
    const timer = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(timer);
  });

  const isStale = $derived(
    failingSince !== null && now - failingSince >= staleAfter,
  );
</script>

<div role="status" class="text-sm whitespace-nowrap">
  {#if isStale}
    <span
      class="inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-500/12 px-2.5 text-amber-800 text-xs dark:bg-amber-400/12 dark:text-amber-300"
    >
      <span class="size-2 shrink-0 rounded-full bg-amber-500" aria-hidden="true"
      ></span>
      <span class="font-semibold">Päivitys viivästyy</span>
      <span class="text-amber-800/80 dark:text-amber-300/80"
        >· viimeksi {timeFormatter.format(failingSince!)}</span
      >
    </span>
  {:else if live}
    <span
      class="inline-flex h-6 items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 dark:bg-red-400/15"
    >
      <span class="relative flex size-2 shrink-0" aria-hidden="true">
        <span
          class="absolute inline-flex size-full animate-ping rounded-full bg-red-500/60 motion-reduce:animate-none"
        ></span>
        <span class="relative inline-flex size-2 rounded-full bg-red-500"
        ></span>
      </span>
      <span
        class="font-semibold text-[11px] text-red-700 tracking-[0.08em] dark:text-red-300"
        >LIVE</span
      >
    </span>
  {/if}
</div>
