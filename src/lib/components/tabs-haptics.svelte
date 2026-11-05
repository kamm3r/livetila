<script lang="ts">
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy, untrack } from "svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Tab = {
    value: string;
    label: string;
    count?: number | string;
    // Spoken in place of the count, for counts that need words ("7/9").
    countLabel?: string;
    content: Snippet;
  };

  let {
    tabs = [],
    defaultValue = tabs[0]?.value ?? "",
    class: className = "",
    onValueChange,
  }: {
    tabs: Tab[];
    defaultValue?: string;
    class?: string;
    onValueChange?: (value: string) => void;
  } = $props();

  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);

  // The default only picks the opening tab; later changes to it (such as a
  // live status update) must not move the user away from their choice.
  let activeTab = $state(untrack(() => defaultValue));
  const activeIndex = $derived(
    Math.max(
      0,
      tabs.findIndex((tab) => tab.value === activeTab),
    ),
  );

  // With nothing to switch to, the tab reads as the list's heading.
  const lone = $derived(tabs.length === 1);

  // Tabs hug their labels, so the indicator takes its size from the active one.
  let listEl = $state<HTMLElement | null>(null);
  let indicator = $state<{ left: number; width: number } | null>(null);
  function measure() {
    const tab =
      listEl?.querySelectorAll<HTMLElement>('[role="tab"]')[activeIndex];
    if (tab) indicator = { left: tab.offsetLeft, width: tab.offsetWidth };
  }
  $effect(() => {
    void activeIndex;
    void tabs.length;
    if (!listEl) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(listEl);
    return () => observer.disconnect();
  });

  function handleTabChange(value: string) {
    activeTab = value;
    trigger("selection");
    onValueChange?.(value);
  }
</script>

<div class="w-full {className}">
  <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
    <div class={lone ? "" : "border-b"}>
      <Tabs.List
        bind:ref={listEl}
        class={cn(
          "motion-tabs w-fit gap-4 rounded-none bg-transparent p-0 sm:gap-6",
          lone ? "h-6" : "h-10",
        )}
      >
        {#if indicator && !lone}
          <span
            class="motion-tab-indicator"
            aria-hidden="true"
            style={`--tab-left: ${indicator.left}px; --tab-width: ${indicator.width}px`}
          ></span>
        {/if}
        {#each tabs as tab (tab.value)}
          <Tabs.Trigger
            value={tab.value}
            class={cn(
              "motion-tab-trigger h-full gap-1.5 rounded-none px-0 data-active:text-primary focus-visible:rounded-sm focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:ring-0",
              lone ? "cursor-default font-semibold text-sm" : "text-[13px]",
            )}
          >
            {tab.label}
            {#if tab.count !== undefined}
              <span class="font-normal text-muted-foreground tabular-nums"
                ><span aria-hidden={tab.countLabel ? true : undefined}
                  ><span class="sr-only">(</span>{tab.count}<span
                    class="sr-only">)</span
                  ></span
                >{#if tab.countLabel}<span class="sr-only"
                    >({tab.countLabel})</span
                  >{/if}</span
              >
            {/if}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
    </div>
    {#each tabs as tab (tab.value)}
      <Tabs.Content value={tab.value} class="mt-3 sm:mt-4">
        {@render tab.content()}
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
