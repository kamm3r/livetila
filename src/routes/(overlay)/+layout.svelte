<script lang="ts">
  let { children } = $props();
</script>

<div class="obs-overlay fixed inset-0 z-50 overflow-auto">
  {@render children()}
</div>

<style>
  :global(body:has(.obs-overlay)) {
    background: transparent;
  }
</style>
