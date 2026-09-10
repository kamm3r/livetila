<script lang="ts">
  import SearchForm from "$lib/components/search-form.svelte";
  import { ChevronRight } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api";

  let search: SearchForm;
  const competitions = createQuery(() => ({
    queryKey: ["competitions"],
    queryFn: () => api.getCompetitions(),
  }));
  const recent = $derived(
    [...(competitions.data ?? [])]
      .sort((a, b) => b.Date.localeCompare(a.Date))
      .slice(0, 6),
  );
  const dateFormat = new Intl.DateTimeFormat("fi-FI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
</script>

<svelte:head>
  <title>Livetila – Yleisurheilun tulokset</title>
  <meta
    name="description"
    content="Etsi yleisurheilukilpailu ja seuraa lajien eräjakoja ja tuloksia Livetilassa."
  />
</svelte:head>

<main class="home-page">
  <div class="home-layout">
    <section class="introduction" aria-labelledby="home-title">
      <h1 id="home-title">Yleisurheilun<br />tulokset.</h1>
      <p class="intro-copy">
        Valitse kilpailu, löydä lajisi ja seuraa tuloksia niiden valmistuessa.
      </p>
      <div class="field-note">
        <span class="field-note-mark" aria-hidden="true"></span>
        <p>Eräjaot, suoritukset ja sijoitukset.<br />Samassa näkymässä.</p>
      </div>
    </section>

    <div class="competition-directory">
      <section aria-labelledby="search-title" class="search-section">
        <h2 id="search-title">Mitä kilpailua seuraat?</h2>
        <SearchForm bind:this={search} />
      </section>

      <section aria-labelledby="recent-title" class="recent-section">
        <div class="section-heading">
          <h2 id="recent-title">Viimeisimmät kilpailut</h2>
          <span>Päivämäärän mukaan</span>
        </div>
        {#if competitions.isPending}
          <p class="directory-message" role="status">Ladataan kilpailuja…</p>
        {:else if competitions.isError}
          <div class="directory-message">
            <p>Kilpailuja ei voitu ladata.</p>
            <button class="retry" onclick={() => competitions.refetch()}
              >Lataa kilpailut uudelleen</button
            >
          </div>
        {:else if recent.length === 0}
          <p class="directory-message">Kilpailuja ei ole vielä saatavilla.</p>
        {:else}
          <ul class="competition-list">
            {#each recent as competition (competition.Id)}
              <li>
                <button
                  class="competition-row"
                  onclick={() => search.selectCompetition(competition)}
                  aria-label={`Valitse kilpailu: ${competition.Name}`}
                >
                  <time datetime={competition.Date}
                    >{dateFormat.format(new Date(competition.Date))}</time
                  >
                  <span class="competition-name">{competition.Name}</span>
                  <ChevronRight class="row-chevron size-4" aria-hidden="true" />
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    </div>
  </div>
</main>

<footer class="home-footer">
  <p>
    Tulostiedot tarjoaa <a href="https://live.tuloslista.com">Tuloslista</a>.
  </p>
  <p>Striimaatko kilpailua? Löydät OBS-overlayn lajin tulosnäkymästä.</p>
</footer>

<style>
  .home-page {
    --home-ink: #243a42;
    --home-muted: #637078;
    --home-wash: #edf5f4;
    --home-accent: #176c66;
    flex: 1;
    padding: clamp(2.5rem, 7vw, 6.5rem) 2rem 5rem;
  }
  :global(.dark) .home-page {
    --home-ink: #edf5f4;
    --home-muted: #a5b4b9;
    --home-wash: #243a42;
    --home-accent: #8fd0c2;
  }
  .home-layout {
    display: grid;
    grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.4fr);
    gap: clamp(3rem, 7vw, 7rem);
    max-width: 1120px;
    margin-inline: auto;
    align-items: start;
  }
  .introduction {
    padding-top: 0.25rem;
  }
  h1 {
    color: var(--home-ink);
    font-size: clamp(2.5rem, 4.6vw, 4rem);
    font-weight: 600;
    line-height: 1.06;
    letter-spacing: -0.055em;
  }
  .intro-copy {
    max-width: 30ch;
    margin-top: 1.5rem;
    color: var(--home-muted);
    font-size: 1rem;
    line-height: 1.7;
  }
  .field-note {
    display: flex;
    align-items: stretch;
    gap: 1rem;
    margin-top: 3rem;
    color: var(--home-muted);
    font-size: 0.8125rem;
    line-height: 1.7;
  }
  .field-note-mark {
    width: 3px;
    background: var(--home-accent);
    border-radius: 2px;
  }
  h2 {
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .search-section h2 {
    margin-bottom: 1rem;
  }
  .recent-section {
    margin-top: 2.75rem;
  }
  .section-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  .section-heading > span {
    font-size: 0.6875rem;
    color: var(--home-muted);
  }
  .competition-list {
    list-style: none;
    padding: 0;
  }
  .competition-list li + li {
    border-top: 1px solid var(--border);
  }
  .competition-row {
    display: grid;
    grid-template-columns: 5.5rem minmax(0, 1fr) 1rem;
    align-items: center;
    gap: 1rem;
    width: 100%;
    min-height: 76px;
    padding: 1rem 0.75rem;
    border-radius: 6px;
    text-align: left;
    cursor: pointer;
    transition: background-color 120ms ease-out;
  }
  .competition-row:hover {
    background: var(--home-wash);
  }
  .competition-row:focus-visible,
  .retry:focus-visible {
    outline: 2px solid var(--home-accent);
    outline-offset: 3px;
  }
  time {
    color: var(--home-muted);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
  .competition-name {
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .competition-row :global(.row-chevron) {
    color: var(--home-muted);
  }
  .directory-message {
    padding-block: 2rem;
    color: var(--home-muted);
    font-size: 0.875rem;
  }
  .retry {
    margin-top: 0.75rem;
    color: var(--home-accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .home-footer {
    display: flex;
    justify-content: space-between;
    gap: 1rem 3rem;
    margin-inline: auto;
    width: min(100%, 1184px);
    padding: 1.5rem 2rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    line-height: 1.6;
  }
  .home-footer a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .home-footer a:hover {
    color: var(--foreground);
  }
  @media (max-width: 760px) {
    .home-page {
      padding: 2rem 1.25rem 3rem;
    }
    .home-layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 2rem;
    }
    h1 {
      font-size: 2.75rem;
    }
    .intro-copy {
      margin-top: 1rem;
      max-width: 36ch;
      font-size: 0.9375rem;
    }
    .field-note {
      display: none;
    }
    .recent-section {
      margin-top: 2rem;
    }
    .competition-row {
      grid-template-columns: 4.5rem minmax(0, 1fr) 1rem;
      gap: 0.625rem;
      padding-inline: 0.25rem;
    }
    .section-heading > span {
      display: none;
    }
    .home-footer {
      flex-direction: column;
      padding: 1.25rem;
      gap: 0.5rem;
    }
  }
</style>
