<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import { buttonVariants } from "$lib/components/ui/button";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import * as Kbd from "$lib/components/ui/kbd/index.js";
  import { cn } from "$lib/utils.js";
  import { Moon, Sun } from "@lucide/svelte";

  type Props = {
    class?: string;
  };

  let { class: className }: Props = $props();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== "d" || event.repeat) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.isContentEditable) return;
    const tag = target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    toggleMode();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<Tooltip.Root>
  <Tooltip.Trigger
    class={cn(
      buttonVariants({ variant: "ghost", size: "icon" }),
      "group/toggle extend-touch-target size-8",
      className,
    )}
    onclick={toggleMode}
    aria-label="Vaihda teema"
  >
    <Sun class="hidden size-4 dark:block" aria-hidden="true" />
    <Moon class="size-4 dark:hidden" aria-hidden="true" />
    <span class="sr-only">Vaihda teema</span>
  </Tooltip.Trigger>
  <Tooltip.Content align="end">
    Paina <Kbd.Root>D</Kbd.Root> vaihtaaksesi teemaa
  </Tooltip.Content>
</Tooltip.Root>
