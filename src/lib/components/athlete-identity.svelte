<script lang="ts">
  import type { AthleteBadgeEntry } from "$lib/athlete-badge";
  import AthleteBadge from "./athlete-badge.svelte";
  import { Badge } from "$lib/components/ui/badge";

  let {
    entry,
    showNumber = false,
    mobile = false,
  }: {
    entry: AthleteBadgeEntry & { Name: string; Number?: string };
    showNumber?: boolean;
    mobile?: boolean;
  } = $props();
</script>

<div class="min-w-0">
  <div class="relative z-10 min-w-0">
    <div class="flex min-w-0 items-center gap-2">
      <AthleteBadge {entry} kind="flag" />
      {#if showNumber && entry.Number}
        <Badge class="shrink-0 bg-primary/10 text-primary">{entry.Number}</Badge
        >
      {/if}
      <span class="font-medium {mobile ? 'truncate text-sm' : ''}"
        >{entry.Name}</span
      >
    </div>
    <p class="mt-0.5 text-xs text-muted-foreground">
      {entry.Organization?.Name ?? "-"}
    </p>
  </div>
</div>
