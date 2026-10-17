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
      class="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300"
    >
      <span class="size-2 shrink-0 rounded-full bg-amber-500" aria-hidden="true"
      ></span>
      <span class="font-semibold">Päivitys viivästyy</span>
      <span class="text-amber-700 dark:text-amber-300/80"
        >· viimeksi {timeFormatter.format(failingSince!)}</span
      >
    </span>
  {:else if live}
    <span class="inline-flex items-center gap-2 py-1">
      <span class="relative flex size-2 shrink-0" aria-hidden="true">
        <span
          class="absolute inline-flex size-full animate-ping rounded-full bg-red-500/60 motion-reduce:animate-none"
        ></span>
        <span class="relative inline-flex size-2 rounded-full bg-red-500"
        ></span>
      </span>
      <span
        class="font-bold text-red-600 text-xs tracking-[0.08em] dark:text-red-400"
        >LIVE</span
      >
    </span>
  {/if}
</div>
