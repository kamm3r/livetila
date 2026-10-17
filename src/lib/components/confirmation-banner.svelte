<script lang="ts">
  import { ExternalLink } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import type { OnlineConfirmation } from "$lib/online-confirmation";

  let {
    confirmation,
    now,
  }: {
    confirmation: OnlineConfirmation;
    now: number;
  } = $props();

  const deadline = $derived(
    confirmation.deadline.toLocaleTimeString("fi-FI", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const remaining = $derived.by(() => {
    const minutes = Math.max(
      1,
      Math.ceil((confirmation.deadline.getTime() - now) / 60_000),
    );
    const hours = Math.floor(minutes / 60);
    if (!hours) return `${minutes} min`;
    return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`;
  });
</script>

<div
  class="flex flex-wrap items-center gap-x-3 gap-y-2.5 rounded-lg border border-primary/25 bg-primary/8 px-3.5 py-2.5"
>
  <div class="flex min-w-0 flex-1 flex-col gap-0.5">
    <p class="font-semibold text-[13px]">Verkkovarmistus on auki</p>
    <p class="text-muted-foreground text-xs tabular-nums">
      <span class="max-sm:hidden">Varmista osallistuminen viimeistään</span>
      klo {deadline} <span class="sm:hidden">asti</span> · {remaining} jäljellä
    </p>
  </div>
  <Button
    href={confirmation.url}
    target="_blank"
    rel="noopener noreferrer"
    class="max-sm:w-full max-sm:h-9"
  >
    <span class="max-sm:hidden">Varmista</span>
    <span class="sm:hidden">Varmista osallistuminen</span>
    <ExternalLink class="size-3.5" aria-hidden="true" />
    <span class="sr-only">(avautuu uuteen välilehteen)</span>
  </Button>
</div>
