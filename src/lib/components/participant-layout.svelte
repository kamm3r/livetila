<script lang="ts">
  import { CheckCircle } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import type { Enrollment } from "~/types/comp";

  let {
    enrollments = [],
  }: {
    enrollments: Enrollment[];
  } = $props();
</script>

{#if enrollments.length > 0}
  <Table.Root
    class="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block"
  >
    <Table.Header class="sticky top-0 backdrop-blur-md">
      <Table.Row>
        <Table.Head class="text-muted-foreground text-xs"></Table.Head>
        <Table.Head class="text-muted-foreground text-xs w-full"
          >Nimi ja Seura</Table.Head
        >
        <Table.Head class="text-muted-foreground text-xs">PB</Table.Head>
        <Table.Head class="text-muted-foreground text-xs">SB</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each enrollments as enrollment (enrollment.Id)}
        <Table.Row
          class={enrollment.Confirmed
            ? "bg-green-300/10 hover:bg-green-300/15"
            : ""}
        >
          <Table.Cell>
            {#if enrollment.Confirmed}
              <div class="flex size-5 items-center justify-center">
                <CheckCircle class="size-3 text-white" />
              </div>
            {/if}
          </Table.Cell>
          <Table.Cell class="w-full">
            <div class="flex flex-col">
              <div class="flex items-center">
                {#if enrollment.Number}
                  <span
                    class="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200"
                    >{enrollment.Number}</span
                  >
                {/if}
                <span class="font-medium">{enrollment.Name}</span>
              </div>
              <div class="mt-1 text-muted-foreground text-xs">
                {enrollment.Organization?.Name ?? "-"}
              </div>
            </div>
          </Table.Cell>
          <Table.Cell
            ><span class="font-medium">{enrollment.PB || "-"}</span></Table.Cell
          >
          <Table.Cell
            ><span class="font-medium">{enrollment.SB || "-"}</span></Table.Cell
          >
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
  <ul class="flex flex-col gap-4 lg:hidden">
    {#each enrollments as enrollment (enrollment.Id)}
      <li
        class="rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4 sm:py-4 {enrollment.Confirmed
          ? 'bg-green-300/10'
          : ''}"
      >
        <div class="flex flex-col gap-2">
          <div>
            <h3 class="font-semibold text-sm sm:text-base">
              {enrollment.Name}
            </h3>
            <p class="text-muted-foreground text-xs">
              {enrollment.Organization?.Name ?? "-"}
            </p>
          </div>
          <div class="flex gap-3 text-xs opacity-70">
            <span>PB {enrollment.PB || "-"}</span>
            <span>SB {enrollment.SB || "-"}</span>
          </div>
        </div>
      </li>
    {/each}
  </ul>
{:else}
  <div class="py-8 text-center">
    <p class="text-muted-foreground">Ei ilmoittautuneita.</p>
  </div>
{/if}
