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
      class="inline-block size-3.5 rounded-full border border-muted-foreground border-dashed align-middle"
      aria-hidden="true"
    ></span>
    <span class="sr-only">Ei vahvistettu</span>
  {/if}
{/snippet}

{#if enrollments.length > 0}
  <div class="data-frame hidden overflow-x-auto lg:block">
    <table class="w-full min-w-[42rem] table-fixed text-sm">
      <thead>
        <tr class="data-head">
          <th class="w-16 pl-4 text-left font-medium" scope="col"
            ><span class="sr-only">Vahvistus</span></th
          >
          <th class="w-11" scope="col"
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
              "h-12 border-t first:border-t-0",
              !enrollment.Confirmed &&
                "text-muted-foreground [&_img]:opacity-80",
            )}
          >
            <td class="pl-4">{@render status(enrollment)}</td>
            <td class="px-1"><AthleteBadge entry={enrollment} /></td>
            <td class="px-2">
              <span class="flex items-center gap-2 whitespace-nowrap">
                <span class="truncate font-medium">{enrollment.Name}</span>
                {#if enrollment.Number}<span
                    class="shrink-0 text-muted-foreground text-xs tabular-nums"
                    >#{enrollment.Number}</span
                  >{/if}
              </span>
            </td>
            <td
              class="max-w-56 truncate px-2 text-[13px] text-muted-foreground"
            >
              {enrollment.Organization?.Name ?? "-"}
            </td>
            <td class="px-2 text-right text-[13px] tabular-nums"
              >{enrollment.PB || "–"}</td
            >
            <td
              class="pr-4 text-right text-[13px] text-muted-foreground tabular-nums"
              >{enrollment.SB || "–"}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <ul class="data-frame lg:hidden">
    {#each sorted as enrollment (enrollment.Id)}
      <li
        class={cn(
          "grid grid-cols-[20px_24px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-t px-3 py-2 first:border-t-0",
          !enrollment.Confirmed && "text-muted-foreground [&_img]:opacity-80",
        )}
      >
        <span class="flex justify-center">{@render status(enrollment)}</span>
        <!-- The cell stays when there is no logo, so the columns hold. -->
        <span class="flex"><AthleteBadge entry={enrollment} /></span>
        <div class="min-w-0">
          <p class="wrap-break-word text-sm leading-5">
            <span class="font-medium">{enrollment.Name}</span>
            {#if enrollment.Number}<span
                class="ml-0.5 text-[11px] text-muted-foreground tabular-nums"
                >#{enrollment.Number}</span
              >{/if}
          </p>
          <p class="truncate text-muted-foreground text-xs leading-4">
            {enrollment.Organization?.Name ?? "-"}
          </p>
        </div>
        <dl
          class="grid grid-cols-[auto_minmax(3.25rem,auto)] gap-x-1.5 text-right text-muted-foreground text-xs leading-tight tabular-nums"
        >
          <dt>PB</dt>
          <dd class="text-foreground">{enrollment.PB || "–"}</dd>
          <dt>SB</dt>
          <dd class="text-foreground">{enrollment.SB || "–"}</dd>
        </dl>
      </li>
    {/each}
  </ul>
  {#if anyPending}
    <ul
      class="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-muted-foreground text-xs"
    >
      <li>
        <Check
          class="inline size-3.5 align-[-2px] text-green-700 dark:text-green-400"
          aria-hidden="true"
        /> = vahvistettu
      </li>
      <li>
        <span
          class="inline-block size-3 rounded-full border border-muted-foreground border-dashed align-[-1px]"
          aria-hidden="true"
        ></span> = ei vielä vahvistanut
      </li>
    </ul>
  {/if}
{:else}
  <Empty.Root>
    <Empty.Description>Ei ilmoittautuneita.</Empty.Description>
  </Empty.Root>
{/if}
