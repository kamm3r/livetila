<script lang="ts">
  import { theme } from "$lib/theme";
  import { useKeyboardShortcut } from "$lib/hooks/use-keyboard-shortcut.svelte";
  import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  import * as Button from "$lib/components/ui/button/index.js";
  import * as Kbd from "$lib/components/ui/kbd/index.js";

  function toggle() {
    theme.toggle();
  }

  useKeyboardShortcut("d", toggle);
</script>

<Tooltip.Root>
  <Tooltip.Trigger>
    {#snippet child({ props })}
      <Button.Root
        {...props}
        variant="ghost"
        size="icon"
        onclick={toggle}
        aria-label="Toggle theme"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
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
      </Button.Root>
    {/snippet}
  </Tooltip.Trigger>
  <Tooltip.Content>
    Paina <Kbd.Root>D</Kbd.Root> vaihtaaksesi teemaa
  </Tooltip.Content>
</Tooltip.Root>
