<script lang="ts">
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import type { Snippet } from "svelte";

  type Tab = {
    value: string;
    label: string;
    icon: Snippet;
    content: Snippet;
  };

  let {
    tabs = [],
    defaultValue = tabs[0]?.value ?? "",
    class: className = "",
  }: {
    tabs: Tab[];
    defaultValue?: string;
    class?: string;
  } = $props();

  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);

  let activeTab = $derived(defaultValue);
  const activeIndex = $derived(
    Math.max(
      0,
      tabs.findIndex((tab) => tab.value === activeTab),
    ),
  );

  function handleTabChange(value: string) {
    activeTab = value;
    trigger("selection");
  }
</script>

<div class="mt-2 w-full {className}">
  <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
    <Tabs.List
      class="motion-tabs w-full"
      style={`--tab-count: ${Math.max(1, tabs.length)}; --tab-index: ${activeIndex}`}
    >
      <span class="motion-tab-indicator" aria-hidden="true"></span>
      {#each tabs as tab (tab.value)}
        <Tabs.Trigger value={tab.value} class="motion-tab-trigger gap-2">
          {@render tab.icon()}
          <span class="sr-only sm:not-sr-only">{tab.label}</span>
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
    {#each tabs as tab (tab.value)}
      <Tabs.Content value={tab.value}>
        {@render tab.content()}
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</div>
