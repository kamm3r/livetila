<script lang="ts">
  import { CheckIcon, CopyIcon } from "@lucide/svelte";

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

<Button variant="secondary" class="w-full gap-2" onclick={copyUrlToClipboard}>
  <div class="relative flex size-4 items-center justify-center">
    <span class="motion-copy-icon" data-visible={!copy} aria-hidden="true">
      <CopyIcon data-icon="inline-start" />
    </span>
    <span class="motion-copy-icon" data-visible={copy} aria-hidden="true">
      <CheckIcon data-icon="inline-start" />
    </span>
  </div>
  <span aria-live="polite" class="text-sm"
    >{copy ? "Kopioitu!" : "Kopioi linkki"}</span
  >
</Button>
