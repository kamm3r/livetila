<script lang="ts">
  import { triggerHaptic } from "$lib/hooks/use-haptics";
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

  let activeTab = $state(defaultValue);

  function handleTabChange(value: string) {
    triggerHaptic("selection");
    activeTab = value;
  }
</script>

<div class="mt-2 w-full {className}">
  <div
    class="relative mb-2 grid h-auto w-full grid-cols-3 rounded-lg bg-muted p-1 text-muted-foreground"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="pointer-events-none absolute inset-y-1 left-1 z-0 rounded-md bg-background shadow-xs transition-[transform,width] duration-200 ease-out motion-reduce:transition-none"
      style="transform: translateX({activeTab === tabs[1]?.value
        ? '100%'
        : activeTab === tabs[2]?.value
          ? '200%'
          : '0%'}); width: calc((100% - 0.5rem) / {Math.min(tabs.length, 3)})"
    ></div>
    {#each tabs as tab}
      <button
        class="relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {activeTab ===
        tab.value
          ? 'text-foreground'
          : 'hover:text-foreground'}"
        onclick={() => handleTabChange(tab.value)}
      >
        <div class="flex items-center justify-center gap-2">
          {@render tab.icon()}
          <span class="hidden sm:block">{tab.label}</span>
        </div>
      </button>
    {/each}
  </div>

  <div class="space-y-5">
    {#each tabs as tab}
      {#if activeTab === tab.value}
        {@render tab.content()}
      {/if}
    {/each}
  </div>
</div>
