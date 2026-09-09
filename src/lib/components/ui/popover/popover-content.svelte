<script lang="ts">
  import { Popover as PopoverPrimitive } from "bits-ui";
  import PopoverPortal from "./popover-portal.svelte";
  import { cn, type WithoutChildrenOrChild } from "$lib/utils.js";
  import type { ComponentProps } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 4,
    align = "center",
    portalProps,
    ...restProps
  }: PopoverPrimitive.ContentProps & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof PopoverPortal>>;
  } = $props();
</script>

<PopoverPortal {...portalProps}>
  <PopoverPrimitive.Content
    bind:ref
    data-slot="popover-content"
    {sideOffset}
    {align}
    class={cn(
      "motion-popover bg-popover text-popover-foreground ring-foreground/10 flex flex-col gap-2.5 rounded-lg p-2.5 text-sm shadow-md ring-1 z-50 w-72 outline-hidden",
      className,
    )}
    {...restProps}
  />
</PopoverPortal>
