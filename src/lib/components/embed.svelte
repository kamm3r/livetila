<script lang="ts">
  import { CheckIcon, CopyIcon } from "@lucide/svelte";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";

  let { slug }: { slug: string } = $props();

  let copy = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  function copyUrlToClipboard() {
    const round = page.url.searchParams.get("round");
    const url = `${window.location.origin}/obs/${slug}?${!round ? "" : "round=1&"}${round === "Final" ? "" : "heat=1"}`;
    void navigator.clipboard.writeText(url);
    copy = true;
    if (copyTimeout !== null) clearTimeout(copyTimeout);
    toast.info("Linkki kopioitu leikepöydälle");
    copyTimeout = setTimeout(() => {
      copy = false;
      copyTimeout = null;
    }, 1500);
  }

  $effect(() => {
    return () => {
      if (copyTimeout !== null) {
        clearTimeout(copyTimeout);
        copyTimeout = null;
      }
    };
  });
</script>

s

<Button
  variant="secondary"
  class="w-full gap-2 active:translate-y-0! active:scale-[0.97] transition-transform"
  onclick={copyUrlToClipboard}
>
  <div class="relative flex size-4 items-center justify-center">
    {#if copy}
      <span class="absolute inset-0" transition:fade={{ duration: 150 }}>
        <CheckIcon data-icon="inline-start" />
      </span>
    {:else}
      <span class="absolute inset-0" transition:fade={{ duration: 150 }}>
        <CopyIcon data-icon="inline-start" />
      </span>
    {/if}
  </div>
  <span class="sr-only text-sm sm:not-sr-only"
    >{copy ? "Kopioitu!" : "Kopioi linkki"}</span
  >
</Button>
