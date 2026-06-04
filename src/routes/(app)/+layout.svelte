<script lang="ts">
  import Navbar from "$lib/components/navbar.svelte";
</script>

<div class="relative flex min-h-dvh flex-col pt-[env(safe-area-inset-top)]">
  <div class="flex min-h-0 flex-1 flex-col">
    <Navbar />
    <slot />
  </div>
</div>
