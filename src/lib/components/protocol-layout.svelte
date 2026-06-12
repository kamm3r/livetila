<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { getRoundContext } from "./round-provider.svelte";

  let {
    isTrack = false,
  }: {
    isTrack: boolean;
  } = $props();

  const ctx = getRoundContext();
</script>

<div class="space-y-6">
  {#if ctx.showHeatNumbers && ctx.heats.length > 0}
    <div
      class="mb-4 flex overflow-x-auto flex-nowrap gap-2 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
    >
      <div
        class="sticky left-0 z-10 shrink-0 self-center rounded-md bg-muted px-2 py-1 text-muted-foreground text-xs"
      >
        Erä:
      </div>
      {#each [...ctx.heats].sort((a, b) => a.Index - b.Index) as heat (heat.Index)}
        <button
          class="shrink-0 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 {ctx.selectedHeat ===
          heat.Index
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}"
          onclick={() => ctx.handleHeatChange(heat.Index)}
        >
          Erä {heat.Index}
        </button>
      {/each}
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
                    <span
                      class="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200"
                      >{alloc.Number}</span
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
    <div class="py-8 text-center">
      <p class="text-muted-foreground">Eräjakoja ei ole saatavilla vielä...</p>
    </div>
  {/if}
</div>
