<script lang="ts">
  import { CheckIcon, CopyIcon } from "@lucide/svelte";
  import { page } from "$app/stores";
  import * as Button from "$lib/components/ui/button/index.js";

  let { slug }: { slug: string } = $props();

  let copy = $state(false);
  let copyTimeout: ReturnType<typeof setTimeout> | null = null;

  function copyUrlToClipboard() {
    const round = $page.url.searchParams.get("round");
    const url = `${window.location.origin}/obs/${slug}?${!round ? "" : "round=1&"}${round === "Final" ? "" : "heat=1"}`;
    navigator.clipboard.writeText(url);
    copy = true;
    if (copyTimeout !== null) clearTimeout(copyTimeout);
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

<Button.Root variant="outline" class="w-full" onclick={copyUrlToClipboard}>
  <div class="relative flex size-4 items-center justify-center">
    {#if copy}
      <CheckIcon class="size-4" />
    {:else}
      <CopyIcon class="size-4" />
    {/if}
  </div>
  <span class="sr-only text-sm sm:not-sr-only"
    >{copy ? "Kopioitu!" : "Kopioi linkki"}</span
  >
</Button.Root>
