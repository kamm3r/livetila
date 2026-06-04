<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
  import { ModeWatcher } from "mode-watcher";
  let { children } = $props();
</script>

<ModeWatcher defaultMode="system" modeStorageKey="theme" disableTransitions />

<div class="relative flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]">
  <div class="flex min-h-0 flex-1 flex-col">
    <Navbar />
    {@render children()}
  </div>
</div>
