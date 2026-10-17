<script lang="ts">
  import { athleteBadge, type AthleteBadgeEntry } from "$lib/athlete-badge";

  let {
    entry,
    class: className = "",
    kind,
    watermark,
  }: {
    entry: AthleteBadgeEntry;
    class?: string;
    kind?: "club" | "flag";
    watermark?: "card" | "row";
  } = $props();
  const badge = $derived(athleteBadge(entry));
  let failedSrc = $state<string | null>(null);
</script>

{#if badge && (!kind || badge.kind === kind) && badge.src !== failedSrc}
  <img
    src={badge.src}
    alt={watermark ? "" : badge.alt}
    aria-hidden={watermark ? true : undefined}
    title={watermark ? undefined : badge.alt}
    width={watermark === "row" ? 48 : watermark ? 96 : 24}
    height={watermark === "row" ? 48 : watermark ? 96 : 20}
    loading="lazy"
    decoding="async"
    class="{watermark
      ? 'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none grayscale opacity-[0.10] mix-blend-multiply dark:invert dark:opacity-[0.12] dark:mix-blend-screen'
      : 'inline-block h-5 w-6 shrink-0'} {watermark === 'row'
      ? 'size-12'
      : watermark
        ? 'size-24'
        : ''} object-contain {className} {badge.kind === 'club' && !watermark
      ? 'rounded-sm bg-white p-0.5'
      : ''}"
    onerror={(event) => {
      failedSrc = event.currentTarget.getAttribute("src");
    }}
  />
{/if}
