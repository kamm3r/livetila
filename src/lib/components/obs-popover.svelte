<script lang="ts">
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  import { Cast } from "@lucide/svelte";
  import { getRoundContext } from "./round-provider.svelte";
  import Embed from "./embed.svelte";
  import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverDescription,
  } from "$lib/components/ui/popover";
  import {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
  } from "$lib/components/ui/drawer";

  import { overlayLink } from "$lib/competition-selection";

  let { slug }: { slug: string } = $props();

  const ctx = getRoundContext();
  let origin = $state("");
  const overlayUrl = $derived(
    origin +
      overlayLink(slug, ctx.rounds, {
        round: ctx.selectedRound,
        heat: ctx.selectedHeat,
      }),
  );

  let open = $state(false);
  let isMobile = $state(false);

  $effect(() => {
    origin = window.location.origin;
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => {
      isMobile = mq.matches;
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  });
  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);
  function handleOpenChange(newOpen: boolean) {
    trigger("selection");
    open = newOpen;
  }
</script>

{#if isMobile}
  <Drawer {open} onOpenChange={handleOpenChange}>
    <DrawerTrigger
      aria-label="OBS Overlay"
      class="sm:hidden inline-flex size-9 items-center justify-center rounded-md text-muted-foreground outline-none select-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary motion-control"
    >
      <Cast class="size-4" aria-hidden="true" />
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>OBS Overlay</DrawerTitle>
        <DrawerDescription>
          Linkki näyttää valitun kierroksen ja erän tulokset.
        </DrawerDescription>
      </DrawerHeader>
      <div class="flex flex-col gap-4 px-4 pt-2 pb-8">
        <div class="flex flex-col gap-2">
          <div
            class="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm"
          >
            {overlayUrl}
          </div>
          <div class="text-muted-foreground text-xs">
            Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen mukaan.
          </div>
        </div>
        <Embed url={overlayUrl} />
      </div>
    </DrawerContent>
  </Drawer>
{:else}
  <Popover {open} onOpenChange={handleOpenChange}>
    <PopoverTrigger
      aria-label="OBS Overlay"
      class="hidden sm:inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 font-medium text-[13px] text-muted-foreground outline-none select-none hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary motion-control"
    >
      <Cast class="size-4" aria-hidden="true" />
      OBS
    </PopoverTrigger>
    <PopoverContent align="end" class="w-full max-w-96 p-0">
      <PopoverHeader class="p-4 pb-0">
        <PopoverTitle>OBS Overlay</PopoverTitle>
        <PopoverDescription>
          Linkki näyttää valitun kierroksen ja erän tulokset.
        </PopoverDescription>
      </PopoverHeader>
      <div class="flex flex-col gap-4 p-4 pt-2">
        <div class="flex flex-col gap-2">
          <div
            class="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm"
          >
            {overlayUrl}
          </div>
          <div class="text-muted-foreground text-xs">
            Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen mukaan.
          </div>
        </div>
        <Embed url={overlayUrl} />
      </div>
    </PopoverContent>
  </Popover>
{/if}
