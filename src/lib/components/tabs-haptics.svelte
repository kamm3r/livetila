<script lang="ts">
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy, untrack } from "svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import type { Snippet } from "svelte";

  type Tab = {
    value: string;
    label: string;
    shortLabel?: string;
    count?: number;
    icon: Snippet;
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

  function handleTabChange(value: string) {
    activeTab = value;
    trigger("selection");
    onValueChange?.(value);
  }
</script>

<div class="mt-2 w-full {className}">
  <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
    <div class="border-b">
      <Tabs.List
        class="motion-tabs motion-tabs-underline h-10 w-full rounded-none bg-transparent p-0 sm:w-fit"
        style={`--tab-count: ${Math.max(1, tabs.length)}; --tab-index: ${activeIndex}`}
      >
        <span class="motion-tab-indicator" aria-hidden="true"></span>
        {#each tabs as tab (tab.value)}
          <Tabs.Trigger
            value={tab.value}
            class="motion-tab-trigger h-full gap-1.5 rounded-none px-3 text-xs sm:px-4 sm:text-[13px]"
          >
            {@render tab.icon()}
            <span class="sm:hidden" aria-hidden="true"
              >{tab.shortLabel ?? tab.label}</span
            >
            <span class="sr-only sm:not-sr-only">{tab.label}</span>
            {#if tab.count !== undefined}
              <span
                class="rounded-full px-1.5 text-[10px] leading-4 tabular-nums {tab.value ===
                activeTab
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'}"
                ><span class="sr-only">(</span>{tab.count}<span class="sr-only"
                  >)</span
                ></span
              >
            {/if}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
    </div>
    {#each tabs as tab (tab.value)}
      <Tabs.Content value={tab.value}>
        {@render tab.content()}
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
