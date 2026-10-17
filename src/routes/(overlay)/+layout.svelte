<script lang="ts">
  let { children } = $props();
</script>

<div class="overlay-root fixed inset-0 z-50 overflow-auto">
  {@render children()}
</div>

<style>
  :global(body:has(.overlay-root)) {
    background: transparent;
  }
</style>
