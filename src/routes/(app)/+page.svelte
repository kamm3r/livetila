<script lang="ts">
  import { goto } from "$app/navigation";
  import { ChevronRight } from "@lucide/svelte";
  import SearchForm from "$lib/components/search-form.svelte";
  import { SearchWorkflow } from "$lib/search-workflow.svelte";
  import type { CompetitionList } from "~/types/comp";

  // Under the search: resume followed events, offer the newest competitions,
  // or step back out of a chosen competition.
  const search = new SearchWorkflow(goto);
  let form = $state<SearchForm>();

  const recent = $derived(search.recentSearches.slice(0, 4));
  const newest = $derived(
    [...search.competitions]
      .sort((a, b) => b.Date.localeCompare(a.Date))
      .slice(0, 4),
  );

  function openCompetition(comp: CompetitionList) {
    search.selectCompetition(comp);
    form?.focus();
  }

  function changeCompetition() {
    search.input("");
    form?.focus();
  }

  // "Kilpailu / M Moukari / Alkuerät" → "M Moukari" and "Alkuerät"
  const eventLabel = (label: string) => label.split(" / ")[1] ?? label;
  const roundLabel = (label: string) => label.split(" / ").slice(2).join(" / ");
  const competitionLabel = (label: string) => label.split(" / ")[0];

  const competitionMeta = (comp: CompetitionList) =>
    [new Date(comp.Date).toLocaleDateString("fi-FI"), comp.Stadion?.Name]
      .filter(Boolean)
      .join(" · ");
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
      <p class="introduction">
        <span class="inline-block">Yleisurheilun tulokset.</span>
        <span class="inline-block">Kentän laidalta kotikatsomoon.</span>
      </p>
      <div class="search-field"><SearchForm bind:this={form} {search} /></div>
      <div class="below-search">
        {#if search.selectedComp}
          <p class="change">
            <button type="button" onclick={changeCompetition}
              >Vaihda kilpailu</button
            >
          </p>
        {:else if recent.length > 0}
          <section class="quick" aria-labelledby="quick-title">
            <h2 id="quick-title">Jatka seuraamista</h2>
            <ul class="data-frame">
              {#each recent as item (item.id)}
                <li>
                  <a href={item.url} title={item.label}>
                    <span class="row-text">
                      <span class="row-title"
                        >{eventLabel(item.label)}
                        <span class="row-round">{roundLabel(item.label)}</span
                        ></span
                      >
                      <span class="row-meta"
                        >{competitionLabel(item.label)}</span
                      >
                    </span>
                    <ChevronRight class="row-arrow" aria-hidden="true" />
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {:else if newest.length > 0}
          <section class="quick" aria-labelledby="quick-title">
            <h2 id="quick-title">Uusimmat kilpailut</h2>
            <ul class="data-frame">
              {#each newest as comp (comp.Id)}
                <li>
                  <button type="button" onclick={() => openCompetition(comp)}>
                    <span class="row-text">
                      <span class="row-title">{comp.Name}</span>
                      <span class="row-meta">{competitionMeta(comp)}</span>
                    </span>
                    <ChevronRight class="row-arrow" aria-hidden="true" />
                  </button>
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      </div>
    </section>
  </div>
</main>
<footer class="home-footer">
  <div class="page-width">
    <a href="https://live.tuloslista.com">Tulostiedot: Tuloslista</a>
  </div>
</footer>

<style>
  .home-page {
    position: relative;
    isolation: isolate;
    flex: 1;
    padding: clamp(2.5rem, 9vh, 5.5rem) 1rem 3rem;
  }
  .search-field {
    margin-top: 1.75rem;
  }
  /* The open search panel replaces the list; its height stays reserved. */
  .home-search:has(:global([data-search-open])) .below-search {
    visibility: hidden;
  }
  /* On a phone an active search also takes the headline's space. */
  @media (max-width: 639px) {
    .home-search:has(:global([data-search-open]))
      :is(h1, .introduction, .below-search) {
      display: none;
    }
    .home-search:has(:global([data-search-open])) .search-field {
      margin-top: 0;
    }
  }
  .home-content {
    width: 100%;
    max-width: 600px;
    margin-inline: auto;
  }
  /* Centred on roomy screens. The list's height stays reserved, so the search
     field does not move when the list loads or gives way to a selection. */
  @media (min-width: 640px) and (min-height: 760px) {
    .home-page {
      display: flex;
      align-items: center;
    }
    .below-search {
      display: flow-root;
      min-height: 20rem;
    }
  }
  .home-search {
    position: relative;
    z-index: 2;
  }
  h1 {
    margin: 0;
    text-align: center;
    font-size: clamp(2.25rem, 5vw, 3.25rem);
    font-weight: 600;
    letter-spacing: -0.035em;
    line-height: 1.08;
    text-wrap: balance;
  }
  h1 span {
    color: var(--primary);
  }
  .introduction {
    margin: 0.875rem 0 0;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 1rem;
    line-height: 1.5;
    text-wrap: balance;
  }
  .change {
    margin: 0.875rem 0 0;
    text-align: center;
    font-size: 0.875rem;
  }
  .change button {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .quick {
    margin-top: 2rem;
  }
  .quick h2 {
    margin: 0 0 0.625rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--muted-foreground);
  }
  .quick li + li {
    border-top: 1px solid var(--border);
  }
  .quick :is(a, button) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    padding: 0.6875rem 0.875rem;
    text-align: left;
    transition: background-color var(--motion-fast) ease;
  }
  .quick :is(a, button):hover {
    background: var(--accent);
  }
  .quick :is(a, button):focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
    border-radius: var(--radius);
  }
  .row-text {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.0625rem;
  }
  .row-title,
  .row-meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-title {
    font-size: 0.875rem;
    font-weight: 500;
  }
  .row-round {
    font-weight: 400;
    color: var(--muted-foreground);
  }
  .row-meta {
    font-size: 0.75rem;
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
  }
  .quick :global(.row-arrow) {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    color: var(--muted-foreground);
  }
  .home-footer {
    padding-block: 1.25rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  .home-footer > div {
    display: flex;
    justify-content: flex-end;
  }
  @media (max-width: 480px) {
    .home-page {
      padding-top: 2.25rem;
    }
  }
  .home-footer a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
