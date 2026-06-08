<script lang="ts">
  import * as Table from "$lib/components/ui/table";
  import { getRoundContext } from "./round-provider.svelte";
  import { getResultContext } from "./result-provider.svelte";
  import { sortByResult } from "$lib/results";

  const ctx = getRoundContext();
  const resultCtx = getResultContext();

  const sortedAllocs = $derived(
    ctx.currentHeat && ctx.heats.length > 0
      ? [...ctx.currentHeat.Allocations].sort((a: any, b: any) =>
          sortByResult(a, b, resultCtx.eventCategory),
        )
      : [],
  );

  const sortedTotal = $derived(
    ctx.currentRound?.TotalResults
      ? [...ctx.currentRound.TotalResults].sort((a: any, b: any) =>
          sortByResult(a, b, resultCtx.eventCategory),
        )
      : [],
  );
</script>

<div class="space-y-6">
  {#if ctx.showHeatNumbers && ctx.heats.length > 0}
    <div
      class="mb-4 flex overflow-x-auto flex-nowrap gap-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        class="sticky left-0 z-10 shrink-0 self-center rounded-md bg-muted px-2 py-1 text-muted-foreground text-xs"
      >
        Erä:
      </div>
      {#each [...ctx.heats].sort((a: any, b: any) => a.Index - b.Index) as heat (heat.Index)}
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
            <Table.Cell>
              {#if alloc.Attempts}
                <ul class="flex gap-2">
                  {#each alloc.Attempts as attempt, i}
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
                  {#each alloc.Attempts as attempt, i}
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
    <div class="py-8 text-center">
      <p class="text-muted-foreground">Tuloksia ei ole saatavilla vielä...</p>
    </div>
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
                    <span
                      class="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200"
                      >{tr.Number}</span
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
                  {#each tr.Attempts as attempt, i}
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
                    <span
                      class="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200"
                      >{tr.Number}</span
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
                  {#each tr.Attempts as attempt, i}
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
