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
  <div class="home-content">
    <section class="home-search" aria-labelledby="home-title">
      <h1 id="home-title">Kilpailun jokainen <span>hetki.</span></h1>
      <div class="search-field"><SearchForm /></div>
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
  .introduction {
    margin: 1.75rem 0 0;
    color: var(--muted-foreground);
    font-size: clamp(0.625rem, 2.8vw, 0.875rem);
    white-space: nowrap;
    line-height: 1.7;
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
