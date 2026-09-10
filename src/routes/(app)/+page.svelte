<script lang="ts">
  import SearchForm from "$lib/components/search-form.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api";
  import { ChevronRight } from "@lucide/svelte";

  let search = $state<SearchForm>();
  const competitions = createQuery(() => ({
    queryKey: ["competitions"],
    queryFn: () => api.getCompetitions(),
  }));
  const recent = $derived(
    [...(competitions.data ?? [])]
      .sort((a, b) => b.Date.localeCompare(a.Date))
      .slice(0, 4),
  );
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
        Yleisurheilun tulokset.<br />Kentän laidalta kotikatsomoon.
      </p>
      <SearchForm bind:this={search} />
    </section>
    <section class="recent" aria-labelledby="recent-title">
      <h2 id="recent-title">Viimeisimmät kilpailut</h2>
      {#if competitions.isPending}<p role="status" class="status">
          Ladataan kilpailuja…
        </p>
      {:else if competitions.isError}<div class="status">
          <p>Kilpailuja ei voitu ladata.</p>
          <button onclick={() => competitions.refetch()}
            >Lataa kilpailut uudelleen</button
          >
        </div>
      {:else if !recent.length}<p class="status">
          Kilpailuja ei ole vielä saatavilla.
        </p>
      {:else}<ul>
          {#each recent as competition (competition.Id)}<li>
              <button onclick={() => search?.selectCompetition(competition)}
                ><span
                  ><strong>{competition.Name}</strong><time
                    datetime={competition.Date}
                    >{new Date(competition.Date).toLocaleDateString("fi-FI", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}</time
                  ></span
                ><ChevronRight
                  class="size-4 shrink-0"
                  aria-hidden="true"
                /></button
              >
            </li>{/each}
        </ul>{/if}
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
    flex: 1;
    padding: clamp(2.5rem, 8vh, 5rem) 1.25rem 3rem;
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
    max-width: 15ch;
    margin: 0 auto;
    font-size: clamp(2.5rem, 5vw, 3.75rem);
    font-weight: 600;
    letter-spacing: -0.055em;
    line-height: 1.08;
    text-wrap: balance;
  }
  h1 span {
    color: var(--primary);
  }
  .introduction {
    margin: 1.25rem 0 2rem;
    color: var(--muted-foreground);
    font-size: 0.9375rem;
    line-height: 1.7;
  }
  .recent {
    margin: 2.75rem 0.5rem 0;
  }
  h2 {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--muted-foreground);
    margin-bottom: 0.75rem;
  }
  .recent li + li {
    border-top: 1px solid var(--border);
  }
  .recent li button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    text-align: left;
    padding: 0.875rem 0.5rem;
    border-radius: 8px;
    cursor: pointer;
  }
  strong {
    display: block;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  time {
    display: block;
    margin-top: 0.125rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  .recent :global(svg) {
    color: var(--muted-foreground);
  }
  @media (hover: hover) and (pointer: fine) {
    .recent li button:hover {
      background: var(--muted);
    }
  }
  button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }
  .status {
    padding-block: 1.5rem;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
  .status button {
    margin-top: 0.5rem;
    text-decoration: underline;
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
    .recent {
      margin-top: 2rem;
    }
    .home-footer {
      padding: 1.25rem;
    }
  }
</style>
