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
  // Without a single PB or SB the columns would only repeat dashes.
  const hasRecords = $derived(
    enrollments.some((entry) => entry.PB || entry.SB),
  );
  const anyPending = $derived(enrollments.some((entry) => !entry.Confirmed));
</script>

{#snippet status(enrollment: Enrollment)}
  {#if enrollment.Confirmed}
    <Check
      class="size-4 text-emerald-700 dark:text-emerald-400"
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
          <th class="w-16 pl-3 text-left font-medium" scope="col"
            ><span class="sr-only">Vahvistus</span></th
          >
          <th class="w-11" scope="col"
            ><span class="sr-only">Seuran logo</span></th
          >
          <th class="px-2 text-left font-medium" scope="col">Urheilija</th>
          <th class="px-2 text-left font-medium" scope="col">Seura</th>
          {#if hasRecords}
            <th class="w-24 pr-5 text-right font-medium" scope="col">PB</th>
            <th class="w-20 pr-4 text-right font-medium" scope="col">SB</th>
          {/if}
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
            <td class="pl-3">
              <span class="flex w-6 items-center justify-center"
                >{@render status(enrollment)}</span
              >
            </td>
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
              class="max-w-56 truncate px-2 pt-0.5 text-ui leading-5 text-muted-foreground"
            >
              {enrollment.Organization?.Name ?? "-"}
            </td>
            {#if hasRecords}
              <td
                class="pt-0.5 pr-5 text-right text-ui leading-5 tabular-nums"
                >{enrollment.PB || "–"}</td
              >
              <td
                class="pt-0.5 pr-4 text-right text-ui leading-5 text-muted-foreground tabular-nums"
                >{enrollment.SB || "–"}</td
              >
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <ul class="data-frame overflow-clip lg:hidden">
    <li
      aria-hidden="true"
      class="data-head sticky top-0 z-10 flex items-center justify-between border-b-0 bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))] px-3"
    >
      <span></span>
      {#if hasRecords}
        <span>PB / SB</span>
      {/if}
    </li>
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
                class="ml-0.5 text-2xs text-muted-foreground tabular-nums"
                >#{enrollment.Number}</span
              >{/if}
          </p>
          <p class="truncate text-muted-foreground text-xs leading-4">
            {enrollment.Organization?.Name ?? "-"}
          </p>
        </div>
        {#if hasRecords}
          <dl class="text-right text-xs leading-tight tabular-nums">
            <dt class="sr-only">PB</dt>
            <dd>{enrollment.PB || "–"}</dd>
            <dt class="sr-only">SB</dt>
            <dd class="text-muted-foreground">{enrollment.SB || "–"}</dd>
          </dl>
        {/if}
      </li>
    {/each}
  </ul>
  {#if anyPending}
    <ul
      class="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-muted-foreground text-xs"
    >
      <li class="flex items-center gap-1">
        <Check
          class="size-3.5 text-emerald-700 dark:text-emerald-400"
          aria-hidden="true"
        />
        = vahvistanut
      </li>
      <li class="flex items-center gap-1">
        <span
          class="size-3 rounded-full border border-muted-foreground border-dashed"
          aria-hidden="true"
        ></span>
        = ei vielä vahvistanut
      </li>
    </ul>
  {/if}
{:else}
  <Empty.Root class="data-frame py-12">
    <Empty.Description>Ei ilmoittautuneita</Empty.Description>
  </Empty.Root>
{/if}
