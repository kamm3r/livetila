<script lang="ts">
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  import { InfoIcon } from "@lucide/svelte";
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

  let { slug }: { slug: string } = $props();

  let open = $state(false);
  let origin = $state("");
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
      class="sm:hidden inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded border border-border bg-background bg-clip-padding px-2.5 font-medium text-sm shadow-xs outline-none select-none hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100 transition-transform duration-100 ease-out dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
    >
      <InfoIcon class="size-4" />
      <span class="sr-only">OBS Overlay</span>
    </DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>OBS Overlay</DrawerTitle>
        <DrawerDescription>
          jos haluut näyttää vain tietyn erän tulokset niin tee näin
        </DrawerDescription>
      </DrawerHeader>
      <div class="flex flex-col gap-4 px-4 pt-2 pb-8">
        <div class="flex flex-col gap-2">
          <div
            class="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm"
          >
            {origin}/obs/{slug}<br />
            <span class="rounded bg-primary/20 px-1 py-0.5 text-primary"
              >?round=1&heat=1</span
            >
          </div>
          <div class="text-muted-foreground text-xs">
            Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen mukaan.
          </div>
        </div>
        <Embed {slug} />
      </div>
    </DrawerContent>
  </Drawer>
{:else}
  <Popover {open} onOpenChange={handleOpenChange}>
    <PopoverTrigger
      class="hidden sm:inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded border border-border bg-background bg-clip-padding px-2.5 font-medium text-sm shadow-xs outline-none select-none hover:border-primary/50 hover:bg-muted hover:text-foreground active:scale-[0.97] motion-reduce:active:scale-100 transition-transform duration-100 ease-out dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
    >
      <InfoIcon class="size-4" />
      <span class="sr-only sm:not-sr-only">OBS Overlay</span>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-full max-w-96 p-0">
      <PopoverHeader class="p-4 pb-0">
        <PopoverTitle>OBS Overlay</PopoverTitle>
        <PopoverDescription>
          jos haluut näyttää vain tietyn erän tulokset niin tee näin
        </PopoverDescription>
      </PopoverHeader>
      <div class="flex flex-col gap-4 p-4 pt-2">
        <div class="flex flex-col gap-2">
          <div
            class="break-all rounded-lg border bg-muted/90 p-3 font-mono text-sm"
          >
            {origin}/obs/{slug}<br />
            <span class="rounded bg-primary/20 px-1 py-0.5 text-primary"
              >?round=1&heat=1</span
            >
          </div>
          <div class="text-muted-foreground text-xs">
            Vaihda <code>round</code> ja <code>heat</code> arvoja tarpeen mukaan.
          </div>
        </div>
        <Embed {slug} />
      </div>
    </PopoverContent>
  </Popover>
{/if}
