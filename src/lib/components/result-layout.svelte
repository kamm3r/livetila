<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import * as ToggleGroup from "$lib/components/ui/toggle-group";
  import * as Empty from "$lib/components/ui/empty";
  import { Badge } from "$lib/components/ui/badge";
  import { getRoundContext } from "./round-provider.svelte";
  import { getResultContext } from "./result-provider.svelte";
  import { sortByResult } from "$lib/results";

  const ctx = getRoundContext();
  const resultCtx = getResultContext();

  const sortedAllocs = $derived(
    ctx.currentHeat && ctx.heats.length > 0
      ? [...ctx.currentHeat.Allocations].sort((a, b) =>
          sortByResult(a, b, resultCtx.eventCategory),
        )
      : [],
  );

  const sortedTotal = $derived(
    ctx.currentRound?.TotalResults
      ? [...ctx.currentRound.TotalResults].sort((a, b) =>
          sortByResult(a, b, resultCtx.eventCategory),
        )
      : [],
  );
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

  {#if sortedAllocs.length > 0}
    <Table.Root
      class="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block"
    >
      <Table.Header class="sticky top-0 backdrop-blur-md">
        <Table.Row>
          <Table.Head class="text-muted-foreground text-xs w-[100px]"
            >Sija</Table.Head
          >
          <Table.Head class="text-muted-foreground text-xs w-full"
            >Nimi ja Seura</Table.Head
          >
          <Table.Head class="text-muted-foreground text-xs">Tulos</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each sortedAllocs as alloc (alloc.Id)}
          <Table.Row>
            <Table.Cell><span>{alloc.HeatRank}</span></Table.Cell>
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
            <Table.Cell>
              {#if alloc.Attempts}
                <ul class="flex gap-2">
                  {#each alloc.Attempts as attempt, i (i)}
                    <li
                      class="-my-1 flex flex-col rounded bg-muted-foreground/20 px-2 py-1 text-sm {alloc.Result ===
                      attempt.Line1
                        ? 'border-primary/20! bg-primary/10! text-primary'
                        : ''}"
                    >
                      <span>{attempt.Line1}</span>
                      {#if attempt.Line2}<span>{attempt.Line2}</span>{/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
    <ul class="flex flex-col gap-3 lg:hidden">
      {#each sortedAllocs as alloc (alloc.Id)}
        <li class="rounded-xl border bg-card px-3 py-3 shadow-sm">
          <div class="flex items-start gap-3">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground"
            >
              {alloc.HeatRank || "-"}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <span class="truncate font-medium text-sm">{alloc.Name}</span>
                  <p class="mt-0.5 text-muted-foreground text-xs">
                    {alloc.Organization?.Name ?? "-"}
                  </p>
                </div>
                {#if !alloc.Attempts?.length && alloc.Result}
                  <span class="shrink-0 font-medium text-sm tabular-nums"
                    >{alloc.Result}</span
                  >
                {/if}
              </div>
              {#if alloc.Attempts}
                <ul class="mt-2 flex flex-wrap gap-1.5">
                  {#each alloc.Attempts as attempt, i (i)}
                    <li
                      class="inline-flex items-center rounded bg-muted-foreground/15 px-1.5 py-0.5 text-xs leading-none {alloc.Result ===
                      attempt.Line1
                        ? 'bg-primary/10 text-primary font-medium'
                        : ''}"
                    >
                      <span>{attempt.Line1}</span>
                      {#if attempt.Line2}<span class="ml-0.5 opacity-60"
                          >/{attempt.Line2}</span
                        >{/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <Empty.Root>
      <Empty.Description>Tuloksia ei ole saatavilla vielä...</Empty.Description>
    </Empty.Root>
  {/if}

  {#if ctx.heats.length > 1 && sortedTotal.length > 0}
    <h3 class="scroll-m-20 font-semibold text-2xl tracking-tight">
      Kokonaistulokset
    </h3>
    <Table.Root
      class="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block"
    >
      <Table.Header class="sticky top-0 backdrop-blur-md">
        <Table.Row>
          <Table.Head class="text-muted-foreground text-xs w-[100px]"
            >Sija</Table.Head
          >
          <Table.Head class="text-muted-foreground text-xs w-full"
            >Nimi ja Seura</Table.Head
          >
          <Table.Head class="text-muted-foreground text-xs">Tulos</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each sortedTotal as tr (tr.Id)}
          <Table.Row>
            <Table.Cell><span>{tr.ResultRank}</span></Table.Cell>
            <Table.Cell class="w-full">
              <div class="flex flex-col">
                <div class="flex items-center">
                  {#if tr.Number}
                    <Badge class="mr-2 bg-primary/10 text-primary"
                      >{tr.Number}</Badge
                    >
                  {/if}
                  <span class="font-medium">{tr.Name}</span>
                </div>
                <div class="mt-1 text-muted-foreground text-xs">
                  {tr.Organization?.Name ?? "-"}
                </div>
              </div>
            </Table.Cell>
            <Table.Cell>
              {#if tr.Attempts}
                <ul class="flex gap-2">
                  {#each tr.Attempts as attempt, i (i)}
                    <li
                      class="-my-1 flex flex-col rounded bg-muted-foreground/20 px-2 py-1 text-sm {tr.Result ===
                      attempt.Line1
                        ? 'border-primary/20! bg-primary/10! text-primary'
                        : ''}"
                    >
                      <span>{attempt.Line1}</span>
                      {#if attempt.Line2}<span>{attempt.Line2}</span>{/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
    <ul class="flex flex-col gap-3 lg:hidden">
      {#each sortedTotal as tr (tr.Id)}
        <li class="rounded-xl border bg-card px-3 py-3 shadow-sm">
          <div class="flex items-start gap-3">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium text-muted-foreground"
            >
              {tr.ResultRank || "-"}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  {#if tr.Number}
                    <Badge class="mr-2 bg-primary/10 text-primary"
                      >{tr.Number}</Badge
                    >
                  {/if}
                  <span class="truncate font-medium text-sm">{tr.Name}</span>
                  <p class="mt-0.5 text-muted-foreground text-xs">
                    {tr.Organization?.Name ?? "-"}
                  </p>
                </div>
                {#if !tr.Attempts?.length && tr.Result}
                  <span class="shrink-0 font-medium text-sm tabular-nums"
                    >{tr.Result}</span
                  >
                {/if}
              </div>
              {#if tr.Attempts}
                <ul class="mt-2 flex flex-wrap gap-1.5">
                  {#each tr.Attempts as attempt, i (i)}
                    <li
                      class="inline-flex items-center rounded bg-muted-foreground/15 px-1.5 py-0.5 text-xs leading-none {tr.Result ===
                      attempt.Line1
                        ? 'bg-primary/10 text-primary font-medium'
                        : ''}"
                    >
                      <span>{attempt.Line1}</span>
                      {#if attempt.Line2}<span class="ml-0.5 opacity-60"
                          >/{attempt.Line2}</span
                        >{/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
