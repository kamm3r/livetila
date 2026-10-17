<script lang="ts">
  import { Check } from "@lucide/svelte";
  import * as Empty from "$lib/components/ui/empty";
  import { cn } from "$lib/utils";
  import type { Enrollment } from "~/types/comp";
  import AthleteBadge from "./athlete-badge.svelte";

  let {
    enrollments = [],
  }: {
    enrollments: Enrollment[];
  } = $props();

  // Confirmed athletes first; the API order is kept within each group.
  const sorted = $derived(
    [...enrollments].sort((a, b) => Number(b.Confirmed) - Number(a.Confirmed)),
  );
  const anyPending = $derived(enrollments.some((entry) => !entry.Confirmed));
</script>

{#snippet status(enrollment: Enrollment)}
  {#if enrollment.Confirmed}
    <Check
      class="size-4 text-green-700 dark:text-green-400"
      aria-hidden="true"
    />
    <span class="sr-only">Vahvistettu</span>
  {:else}
    <span
      class="hatch inline-block size-4 rounded-[3px] align-middle"
      aria-hidden="true"
    ></span>
    <span class="sr-only">Ei vahvistettu</span>
  {/if}
{/snippet}

{#if enrollments.length > 0}
  <div class="hidden overflow-x-auto rounded-lg border lg:block">
    <table class="w-full text-sm">
      <thead>
        <tr class="h-[34px] border-b text-[11px] text-muted-foreground">
          <th class="w-14 pl-4 text-left font-medium" scope="col"
            ><span class="sr-only">Vahvistus</span></th
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
      <tbody>
        {#each sorted as enrollment (enrollment.Id)}
          <tr
            class={cn(
              "h-[46px] border-t first:border-t-0",
              !enrollment.Confirmed && "*:opacity-55",
            )}
          >
            <td class="pl-4">{@render status(enrollment)}</td>
            <td class="px-1"><AthleteBadge entry={enrollment} kind="club" /></td
            >
            <td class="px-2">
              <span class="flex items-center gap-2 whitespace-nowrap">
                <AthleteBadge entry={enrollment} kind="flag" />
                <span class="font-semibold">{enrollment.Name}</span>
                {#if enrollment.Number}<span
                    class="text-muted-foreground text-xs tabular-nums"
                    >#{enrollment.Number}</span
                  >{/if}
              </span>
            </td>
            <td
              class="max-w-56 truncate px-2 text-[13px] text-muted-foreground"
            >
              {enrollment.Organization?.Name ?? "-"}
            </td>
            <td class="px-2 text-right tabular-nums">{enrollment.PB || "–"}</td>
            <td class="pr-4 text-right tabular-nums">{enrollment.SB || "–"}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <ul class="overflow-hidden rounded-lg border lg:hidden">
    {#each sorted as enrollment (enrollment.Id)}
      <li
        class={cn(
          "grid grid-cols-[20px_24px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-t px-3 py-2.5 first:border-t-0",
          !enrollment.Confirmed && "*:opacity-55",
        )}
      >
        <span class="flex justify-center">{@render status(enrollment)}</span>
        <AthleteBadge entry={enrollment} kind="club" />
        <div class="min-w-0">
          <div class="flex min-w-0 items-baseline gap-1.5">
            <AthleteBadge entry={enrollment} kind="flag" />
            <span class="truncate font-semibold text-sm">{enrollment.Name}</span
            >
            {#if enrollment.Number}<span
                class="shrink-0 text-[11px] text-muted-foreground tabular-nums"
                >#{enrollment.Number}</span
              >{/if}
          </div>
          <p class="truncate text-muted-foreground text-xs">
            {enrollment.Organization?.Name ?? "-"}
          </p>
        </div>
        <div
          class="text-right text-muted-foreground text-xs leading-tight tabular-nums"
        >
          <div>
            PB <span class="font-semibold text-foreground"
              >{enrollment.PB || "–"}</span
            >
          </div>
          <div>
            SB <span class="font-semibold text-foreground"
              >{enrollment.SB || "–"}</span
            >
          </div>
        </div>
      </li>
    {/each}
  </ul>
  {#if anyPending}
    <p class="mt-2 text-[11px] text-muted-foreground">
      ✓ = vahvistettu ·
      <span
        class="hatch inline-block size-2.5 rounded-[2px] align-[-1px]"
        aria-hidden="true"
      ></span>
      = ei vielä vahvistanut
    </p>
  {/if}
{:else}
  <Empty.Root>
    <Empty.Description>Ei ilmoittautuneita.</Empty.Description>
  </Empty.Root>
{/if}
