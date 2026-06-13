<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children: Snippet } = $props();
</script>

<ul class="flex flex-col gap-1">
  {@render children()}
</ul>
