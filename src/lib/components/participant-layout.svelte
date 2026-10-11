<script lang="ts">
  import { CheckCircle } from "@lucide/svelte";
  import * as Table from "$lib/components/ui/table";
  import * as Empty from "$lib/components/ui/empty";
  import type { Enrollment } from "~/types/comp";
  import AthleteIdentity from "./athlete-identity.svelte";
  import AthleteBadge from "./athlete-badge.svelte";

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
        <Table.Head class="text-muted-foreground text-xs">Vahvistus</Table.Head>
        <Table.Head class="text-muted-foreground text-xs w-full"
          >Nimi ja seura</Table.Head
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
              <span
                class="inline-flex items-center gap-1 text-xs text-green-800 dark:text-green-300"
              >
                <CheckCircle class="size-4 shrink-0" aria-hidden="true" />
                <span class="sr-only">Vahvistettu</span>
              </span>
            {:else}
              <span class="sr-only">Ei vahvistettu</span>
            {/if}
          </Table.Cell>
          <Table.Cell class="relative isolate w-full overflow-hidden pr-16">
            <AthleteBadge entry={enrollment} kind="club" watermark="row" />
            <AthleteIdentity entry={enrollment} showNumber />
          </Table.Cell>
          <Table.Cell
            ><span class="font-medium">{enrollment.PB || "-"}</span></Table.Cell
          >
          <Table.Cell
            ><span class="font-medium">{enrollment.SB || "-"}</span></Table.Cell
          ></Table.Row
        >
      {/each}
    </Table.Body>
  </Table.Root>
  <ul class="flex flex-col gap-4 lg:hidden">
    {#each enrollments as enrollment (enrollment.Id)}
      <li
        class="relative isolate overflow-hidden rounded-xl border bg-card px-3 py-3 shadow-sm sm:px-4 sm:py-4 {enrollment.Confirmed
          ? 'bg-green-300/10'
          : ''}"
      >
        <AthleteBadge entry={enrollment} kind="club" watermark="card" />
        <div class="relative z-10 flex flex-col gap-2">
          <div>
            <AthleteIdentity entry={enrollment} mobile />
            {#if enrollment.Confirmed}
              <span
                class="mt-1 inline-flex items-center gap-1 text-xs text-green-800 dark:text-green-300"
              >
                <CheckCircle class="size-4 shrink-0" aria-hidden="true" />
                <span class="sr-only">Vahvistettu</span>
              </span>
            {:else}
              <span class="sr-only">Ei vahvistettu</span>
            {/if}
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
  <Empty.Root>
    <Empty.Description>Ei ilmoittautuneita.</Empty.Description>
  </Empty.Root>
{/if}
