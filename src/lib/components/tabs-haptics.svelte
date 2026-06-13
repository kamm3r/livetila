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

  function handleTabChange(value: string) {
    trigger("selection");
  }
</script>

<div class="mt-2 w-full {className}">
  <Tabs.Root value={defaultValue} onValueChange={handleTabChange}>
    <Tabs.List class="w-full">
      {#each tabs as tab (tab.value)}
        <Tabs.Trigger value={tab.value} class="gap-2">
          {@render tab.icon()}
          <span class="hidden sm:block">{tab.label}</span>
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
