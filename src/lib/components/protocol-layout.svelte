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
  <span class="text-foreground">Erä {index}</span>
  · {count} urheilijaa
{/snippet}

{#if heats.some((heat) => heat.allocations.length > 0)}
  <div class="data-frame hidden overflow-x-auto lg:block">
    <table class="w-full min-w-[42rem] table-fixed text-sm">
      <thead>
        <tr class="data-head">
          <th class="w-16 pl-3 text-left font-medium" scope="col"
            >{leadLabel}</th
          >
          <th class="w-11" scope="col"
            ><span class="sr-only">Seuran logo</span></th
          >
          <th class="px-2 text-left font-medium" scope="col">Urheilija</th>
          <th class="px-2 text-left font-medium" scope="col">Seura</th>
          <th class="w-24 pr-5 text-right font-medium" scope="col">PB</th>
          <th class="w-20 pr-4 text-right font-medium" scope="col">SB</th>
        </tr>
      </thead>
      {#each heats as heat (heat.index)}
        <tbody>
          {#if showHeatRows}
            <tr class="h-[34px] border-t bg-primary/5">
              <th
                class="pl-3 text-left font-normal text-muted-foreground text-xs"
                colspan="6"
                scope="colgroup"
              >
                {@render heatLabel(heat.index, heat.allocations.length)}
              </th>
            </tr>
          {/if}
          {#each heat.allocations as alloc (alloc.Id)}
            <tr class="h-12 border-t first:border-t-0">
              <td class="pl-3 font-semibold text-sm tabular-nums">
                <span class="inline-block w-6 text-center"
                  >{alloc.Position || ""}</span
                >
              </td>
              <td class="px-1"><AthleteBadge entry={alloc} /></td>
              <td class="px-2">
                <span class="flex items-center gap-2 whitespace-nowrap">
                  <span class="truncate font-medium">{alloc.Name}</span>
                  {#if alloc.Number}<span
                      class="shrink-0 text-muted-foreground text-xs tabular-nums"
                      >#{alloc.Number}</span
                    >{/if}
                </span>
              </td>
              <td
                class="max-w-56 truncate px-2 pt-0.5 text-[13px] leading-5 text-muted-foreground"
              >
                {alloc.Organization?.Name ?? "-"}
              </td>
              <td
                class="pt-0.5 pr-5 text-right text-[13px] leading-5 tabular-nums"
                >{alloc.PB || "–"}</td
              >
              <td
                class="pt-0.5 pr-4 text-right text-[13px] leading-5 text-muted-foreground tabular-nums"
                >{alloc.SB || "–"}</td
              >
            </tr>
          {/each}
        </tbody>
      {/each}
    </table>
  </div>

  <ul class="data-frame lg:hidden">
    <li
      aria-hidden="true"
      class="data-head flex h-auto items-center justify-between border-b-0 px-3 py-1.5"
    >
      <span>{leadLabel}</span>
      <span class="flex flex-col text-right leading-tight"
        ><span>PB</span><span>SB</span></span
      >
    </li>
    {#each heats as heat (heat.index)}
      {#if showHeatRows}
        <li
          class="border-t bg-primary/5 px-3 py-2 text-muted-foreground text-xs first:border-t-0"
        >
          {@render heatLabel(heat.index, heat.allocations.length)}
        </li>
      {/if}
      {#each heat.allocations as alloc (alloc.Id)}
        <li
          class="grid grid-cols-[24px_24px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-t px-3 py-2 first:border-t-0"
        >
          <span class="text-left font-semibold text-sm tabular-nums"
            >{alloc.Position || "-"}</span
          >
          <!-- The cell stays when there is no logo, so the columns hold. -->
          <span class="flex"><AthleteBadge entry={alloc} /></span>
          <div class="min-w-0">
            <p class="wrap-break-word text-sm leading-5">
              <span class="font-medium">{alloc.Name}</span>
              {#if alloc.Number}<span
                  class="ml-0.5 text-[11px] text-muted-foreground tabular-nums"
                  >#{alloc.Number}</span
                >{/if}
            </p>
            <p class="truncate text-muted-foreground text-xs leading-4">
              {alloc.Organization?.Name ?? "-"}
            </p>
          </div>
          <dl class="text-right text-xs leading-tight tabular-nums">
            <dt class="sr-only">PB</dt>
            <dd>{alloc.PB || "–"}</dd>
            <dt class="sr-only">SB</dt>
            <dd class="text-muted-foreground">{alloc.SB || "–"}</dd>
          </dl>
        </li>
      {/each}
    {/each}
  </ul>
{:else}
  <Empty.Root class="data-frame py-12">
    <Empty.Description>Eräjakoja ei ole vielä.</Empty.Description>
  </Empty.Root>
{/if}
