<script lang="ts">
  let { children } = $props();
</script>

<div class="fixed inset-0 z-50">
  {@render children()}
</div>
