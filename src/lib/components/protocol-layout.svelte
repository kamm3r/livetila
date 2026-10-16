<script lang="ts">
  import * as Empty from "$lib/components/ui/empty";
  import { protocolOrder } from "$lib/results";
  import { getRoundContext } from "./round-provider.svelte";
  import AthleteBadge from "./athlete-badge.svelte";

  let {
    isTrack = false,
  }: {
    isTrack: boolean;
  } = $props();

  const ctx = getRoundContext();
  // Every heat in one table; a heat row only separates them when there are several.
  const heats = $derived(protocolOrder(ctx.heats));
  const showHeatRows = $derived(heats.length > 1);
  const leadLabel = $derived(isTrack ? "Rata" : "Järj.");
</script>

{#snippet heatLabel(index: number, count: number)}
  <span class="font-semibold text-foreground">Erä {index}</span>
  · {count} urheilijaa
{/snippet}

{#if heats.some((heat) => heat.allocations.length > 0)}
  <div class="hidden overflow-x-auto rounded-lg border lg:block">
    <table class="w-full text-sm">
      <thead>
        <tr class="h-[34px] border-b text-[11px] text-muted-foreground">
          <th class="w-14 pl-4 text-left font-medium" scope="col"
            >{leadLabel}</th
          >
          <th class="w-10" scope="col"
            ><span class="sr-only">Seuran logo</span></th
          >
          <th class="px-2 text-left font-medium" scope="col">Urheilija</th>
          <th class="px-2 text-left font-medium" scope="col">Seura</th>
          <th class="w-20 px-2 text-right font-medium" scope="col">PB</th>
          <th class="w-24 pr-4 text-right font-medium" scope="col">SB</th>
        </tr>
      </thead>
      {#each heats as heat (heat.index)}
        <tbody>
          {#if showHeatRows}
            <tr class="h-[34px] border-t bg-muted/60 first:border-t-0">
              <th
                class="pl-4 text-left font-normal text-muted-foreground text-xs"
                colspan="6"
                scope="colgroup"
              >
                {@render heatLabel(heat.index, heat.allocations.length)}
              </th>
            </tr>
          {/if}
          {#each heat.allocations as alloc (alloc.Id)}
            <tr class="h-[46px] border-t first:border-t-0">
              <td class="pl-4 font-bold text-[15px] tabular-nums"
                >{alloc.Position || ""}</td
              >
              <td class="px-1"><AthleteBadge entry={alloc} kind="club" /></td>
              <td class="px-2">
                <span class="flex items-center gap-2 whitespace-nowrap">
                  <AthleteBadge entry={alloc} kind="flag" />
                  <span class="font-semibold">{alloc.Name}</span>
                  {#if alloc.Number}<span
                      class="text-muted-foreground text-xs tabular-nums"
                      >#{alloc.Number}</span
                    >{/if}
                </span>
              </td>
              <td
                class="max-w-56 truncate px-2 text-[13px] text-muted-foreground"
              >
                {alloc.Organization?.Name ?? "-"}
              </td>
              <td class="px-2 text-right tabular-nums">{alloc.PB || "–"}</td>
              <td class="pr-4 text-right tabular-nums">{alloc.SB || "–"}</td>
            </tr>
          {/each}
        </tbody>
      {/each}
    </table>
  </div>

  <ul class="overflow-hidden rounded-lg border lg:hidden">
    {#each heats as heat (heat.index)}
      {#if showHeatRows}
        <li
          class="border-t bg-muted/60 px-3 py-2 text-muted-foreground text-xs first:border-t-0"
        >
          {@render heatLabel(heat.index, heat.allocations.length)}
        </li>
      {/if}
      {#each heat.allocations as alloc (alloc.Id)}
        <li
          class="grid grid-cols-[24px_24px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-t px-3 py-2.5 first:border-t-0"
        >
          <span class="text-center font-bold text-[15px] tabular-nums"
            >{alloc.Position || "-"}</span
          >
          <AthleteBadge entry={alloc} kind="club" />
          <div class="min-w-0">
            <div class="flex min-w-0 items-baseline gap-1.5">
              <AthleteBadge entry={alloc} kind="flag" />
              <span class="truncate font-semibold text-sm">{alloc.Name}</span>
              {#if alloc.Number}<span
                  class="shrink-0 text-[11px] text-muted-foreground tabular-nums"
                  >#{alloc.Number}</span
                >{/if}
            </div>
            <p class="truncate text-muted-foreground text-xs">
              {alloc.Organization?.Name ?? "-"}
            </p>
          </div>
          <div
            class="text-right text-muted-foreground text-xs leading-tight tabular-nums"
          >
            <div>
              PB <span class="font-semibold text-foreground"
                >{alloc.PB || "–"}</span
              >
            </div>
            <div>
              SB <span class="font-semibold text-foreground"
                >{alloc.SB || "–"}</span
              >
            </div>
          </div>
        </li>
      {/each}
    {/each}
  </ul>
{:else}
  <Empty.Root>
    <Empty.Description>Eräjakoja ei ole saatavilla vielä...</Empty.Description>
  </Empty.Root>
{/if}
