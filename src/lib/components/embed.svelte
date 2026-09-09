<script lang="ts">
  import { CheckIcon, CopyIcon } from "@lucide/svelte";

  import { fade } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import { Button } from "$lib/components/ui/button";

  let { url }: { url: string } = $props();

  let copy = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  async function copyUrlToClipboard() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      toast.error("Linkin kopiointi epäonnistui");
      return;
    }
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
