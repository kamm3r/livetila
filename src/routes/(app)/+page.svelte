<script lang="ts">
  import SearchForm from "$lib/components/search-form.svelte";
</script>

<svelte:head>
  <title>Livetila – Yleisurheilun tulokset</title>
  <meta
    name="description"
    content="Etsi yleisurheilukilpailu ja seuraa lajien eräjakoja ja tuloksia Livetilassa."
  />
</svelte:head>

<main class="home-page">
  <section class="home-content" aria-labelledby="home-title">
    <div class="home-intro">
      <h1 id="home-title">Kilpailun jokainen hetki.</h1>
      <svg
        class="track-accent"
        viewBox="0 0 240 30"
        fill="none"
        aria-hidden="true"
      >
        <path d="M3 23H184C204 23 216 17 237 3" />
        <path d="M3 16H181C201 16 213 11 230 1" />
        <path d="M3 9H177C192 9 204 6 215 1" />
      </svg>
      <p class="introduction">
        Löydä kilpailusi ja seuraa tuloksia reaaliajassa.<br
          class="desktop-break"
        /> Kentän laidalta tai kotikatsomosta.
      </p>
    </div>

    <div class="home-search">
      <SearchForm />
    </div>

    <p class="overlay-note">
      Striimaatko kilpailua? Löydät OBS-overlayn lajin tulosnäkymästä.
    </p>
  </section>
</main>

<footer class="home-footer">
  <span>Eräjaot ja tulokset samassa näkymässä.</span>
  <span>Tulostiedot: <a href="https://live.tuloslista.com">Tuloslista</a></span>
</footer>

<style>
  .home-page {
    flex: 1;
    padding: clamp(3rem, 9vh, 6rem) 1.25rem 4rem;
  }
  .home-content {
    width: 100%;
    max-width: 640px;
    margin-inline: auto;
  }
  .home-intro {
    text-align: center;
  }
  h1 {
    max-width: 12ch;
    margin-inline: auto;
    font-size: clamp(2.75rem, 6vw, 4.25rem);
    font-weight: 600;
    line-height: 1.05;
    letter-spacing: -0.055em;
    text-wrap: balance;
  }
  .track-accent {
    display: block;
    width: clamp(140px, 24vw, 210px);
    height: auto;
    margin: 1.125rem auto 0;
    color: var(--primary);
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }
  .track-accent path:nth-child(2) {
    opacity: 0.6;
  }
  .track-accent path:nth-child(3) {
    opacity: 0.3;
  }
  .introduction {
    margin-top: 1.5rem;
    font-size: 1rem;
    line-height: 1.75;
    color: var(--muted-foreground);
    text-wrap: pretty;
  }
  .home-search {
    margin-top: 2.75rem;
  }
  .overlay-note {
    max-width: 48ch;
    margin: 2rem auto 0;
    text-align: center;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    line-height: 1.7;
  }
  .home-footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.75rem 2rem;
    padding: 1.25rem 2rem;
    border-top: 1px solid var(--border);
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  .home-footer a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .home-footer a:hover {
    color: var(--foreground);
  }
  @media (max-width: 480px) {
    .introduction {
      font-size: 0.9375rem;
    }
    .desktop-break {
      display: none;
    }
    .home-search {
      margin-top: 2rem;
    }
    .home-footer {
      padding: 1.25rem;
      font-size: 0.6875rem;
    }
  }
</style>
