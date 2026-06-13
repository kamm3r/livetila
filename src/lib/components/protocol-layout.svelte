<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import * as Empty from "$lib/components/ui/empty";
  import { Badge } from "$lib/components/ui/badge";
  import { getRoundContext } from "./round-provider.svelte";

  let {
    isTrack = false,
  }: {
    isTrack: boolean;
  } = $props();

  const ctx = getRoundContext();
</script>

<div class="flex flex-col gap-6">
  {#if ctx.showHeatNumbers && ctx.heats.length > 0}
    <div
      class="mb-4 flex overflow-x-auto flex-nowrap gap-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      <ToggleGroup.Root
        type="single"
        value={String(ctx.selectedHeat)}
        onValueChange={(v) => ctx.handleHeatChange(Number(v))}
        variant="outline"
        size="sm"
      >
        {#each [...ctx.heats].sort((a, b) => a.Index - b.Index) as heat (heat.Index)}
          <ToggleGroup.Item value={String(heat.Index)}>
            Erä {heat.Index}
          </ToggleGroup.Item>
        {/each}
      </ToggleGroup.Root>
    </div>
  {/if}

  {#if ctx.currentHeat && ctx.heats.length > 0}
    {@const heatAllocs = [...ctx.currentHeat.Allocations]}
    <Table.Root
      class="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block"
    >
      <Table.Header class="sticky top-0 backdrop-blur-md">
        <Table.Row>
          <Table.Head class="text-muted-foreground text-xs w-[100px]"
            >{isTrack ? "Rata" : "Järjestys"}</Table.Head
          >
          <Table.Head class="text-muted-foreground text-xs w-full"
            >Nimi ja Seura</Table.Head
          >
          <Table.Head class="text-muted-foreground text-xs">PB</Table.Head>
          <Table.Head class="text-muted-foreground text-xs">SB</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each heatAllocs as alloc (alloc.Id)}
          <Table.Row>
            <Table.Cell><span>{alloc.Number || ""}</span></Table.Cell>
            <Table.Cell class="w-full">
              <div class="flex flex-col">
                <div class="flex items-center">
                  {#if alloc.Number}
                    <Badge class="mr-2 bg-primary/10 text-primary"
                      >{alloc.Number}</Badge
                    >
                  {/if}
                  <span class="font-medium">{alloc.Name}</span>
                </div>
                <div class="mt-1 text-muted-foreground text-xs">
                  {alloc.Organization?.Name ?? "-"}
                </div>
              </div>
            </Table.Cell>
            <Table.Cell
              ><span class="font-medium">{alloc.PB || "-"}</span></Table.Cell
            >
            <Table.Cell
              ><span class="font-medium">{alloc.SB || "-"}</span></Table.Cell
            >
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
    <ul class="flex flex-col gap-3 lg:hidden">
      {#each heatAllocs as alloc (alloc.Id)}
        <li class="rounded-xl border bg-card px-3 py-3 shadow-sm">
          <div class="flex items-start gap-3">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground"
            >
              {alloc.Number || "-"}
            </div>
            <div class="min-w-0 flex-1">
              <span class="truncate font-medium text-sm">{alloc.Name}</span>
              <p class="mt-0.5 text-muted-foreground text-xs">
                {alloc.Organization?.Name ?? "-"}
              </p>
              <div class="mt-1 flex gap-3 text-xs text-muted-foreground">
                <span>PB {alloc.PB || "-"}</span>
                <span>SB {alloc.SB || "-"}</span>
              </div>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <Empty.Root>
      <Empty.Description>Eräjakoja ei ole saatavilla vielä...</Empty.Description
      >
    </Empty.Root>
  {/if}
</div>
