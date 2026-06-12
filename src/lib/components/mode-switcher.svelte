<script lang="ts">
  import { toggleMode } from "mode-watcher";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import * as Kbd from "$lib/components/ui/kbd/index.js";
  import { cn } from "$lib/utils.js";

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
  <Tooltip.Trigger>
    <Button
      variant="ghost"
      size="icon"
      class={cn("group/toggle extend-touch-target size-8", className)}
      onclick={toggleMode}
      aria-label="Toggle theme"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4.5"
        aria-hidden="true"
      >
        <path d="M0 0h24v24H0z" stroke="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 3l0 18" />
        <path d="M12 9l4.65 -4.65" />
        <path d="M12 14.3l7.37 -7.37" />
        <path d="M12 19.6l8.85 -8.85" />
      </svg>
      <span class="sr-only">Toggle theme</span>
    </Button>
  </Tooltip.Trigger>
  <Tooltip.Content>
    Paina <Kbd.Root>D</Kbd.Root> vaihtaaksesi teemaa
  </Tooltip.Content>
</Tooltip.Root>
