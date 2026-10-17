<script lang="ts">
  import { goto } from "$app/navigation";
  import SearchForm from "$lib/components/search-form.svelte";
  import { SearchWorkflow } from "$lib/search-workflow.svelte";
  import type { CompetitionList } from "~/types/comp";

  // One line under the search: resume followed events, offer the newest
  // competitions, or step back out of a chosen competition.
  const search = new SearchWorkflow(goto);
  let form = $state<SearchForm>();

  const recent = $derived(search.recentSearches.slice(0, 2));
  const newest = $derived(
    [...search.competitions]
      .sort((a, b) => b.Date.localeCompare(a.Date))
      .slice(0, 3),
  );

  function openCompetition(comp: CompetitionList) {
    search.selectCompetition(comp);
    form?.focus();
  }

  function changeCompetition() {
    search.input("");
    form?.focus();
  }

  // "Kilpailu / M Moukari / Alkuerät" → "M Moukari, Alkuerät"
  const shortLabel = (label: string) =>
    label.split(" / ").slice(1).join(", ") || label;
</script>

<svelte:head>
  <title>Livetila – Yleisurheilun tulokset</title>
  <meta
    name="description"
    content="Etsi yleisurheilukilpailu ja seuraa lajien eräjakoja ja tuloksia Livetilassa."
  />
</svelte:head>

<main class="home-page">
  <div class="home-content">
    <section class="home-search" aria-labelledby="home-title">
      <h1 id="home-title">Kilpailun jokainen <span>hetki.</span></h1>
      <div class="search-field"><SearchForm bind:this={form} {search} /></div>
      {#if search.selectedComp}
        <p class="quick">
          <button type="button" onclick={changeCompetition}
            >Vaihda kilpailu</button
          >
        </p>
      {:else if recent.length > 0}
        <p class="quick">
          <span class="quick-label">Jatka:</span>
          {#each recent as item, index (item.id)}
            {#if index > 0}<span aria-hidden="true">·</span>{/if}
            <a href={item.url} title={item.label}>{shortLabel(item.label)}</a>
          {/each}
        </p>
      {:else if newest.length > 0}
        <p class="quick">
          <span class="quick-label">Uusimmat:</span>
          {#each newest as comp, index (comp.Id)}
            {#if index > 0}<span aria-hidden="true">·</span>{/if}
            <button type="button" onclick={() => openCompetition(comp)}
              >{comp.Name}</button
            >
          {/each}
        </p>
      {/if}
      <p class="introduction">
        Yleisurheilun tulokset. Kentän laidalta kotikatsomoon.
      </p>
    </section>
  </div>
</main>
<footer class="home-footer">
  <span>Livetila</span><a href="https://live.tuloslista.com"
    >Tulostiedot: Tuloslista</a
  >
</footer>

<style>
  .home-page {
    position: relative;
    isolation: isolate;
    flex: 1;
    padding: 3.5rem 1.25rem 3rem;
  }
  .search-field {
    margin-top: 2rem;
  }
  .home-content {
    max-width: 640px;
    margin-inline: auto;
  }
  .home-search {
    text-align: center;
    position: relative;
    z-index: 2;
  }
  h1 {
    max-width: 16ch;
    margin: 0 auto;
    font-size: clamp(2.25rem, 4vw, 3.25rem);
    font-weight: 600;
    letter-spacing: -0.055em;
    line-height: 1.12;
    text-wrap: balance;
  }
  h1 span {
    color: var(--primary);
  }
  .quick {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem 0.5rem;
    margin: 1rem 0 0;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
  .quick-label {
    color: color-mix(in oklch, var(--muted-foreground) 70%, transparent);
  }
  .quick :is(a, button) {
    max-width: 22ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--foreground);
    text-decoration: underline;
    text-decoration-color: color-mix(
      in oklch,
      var(--foreground) 25%,
      transparent
    );
    text-underline-offset: 3px;
    transition: text-decoration-color var(--motion-fast) ease;
  }
  .quick :is(a, button):hover {
    text-decoration-color: var(--primary);
  }
  .introduction {
    margin: 1.75rem auto 0;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    line-height: 1.7;
    text-wrap: balance;
  }
  .home-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 2rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  .home-footer a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  @media (max-width: 480px) {
    .home-page {
      padding-top: 2rem;
    }
    .home-footer {
      padding: 1.25rem;
    }
  }
</style>
