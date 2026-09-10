<script lang="ts">
  import { page } from "$app/state";
  import SearchForm from "$lib/components/search-form.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api";

  const options = [
    {
      name: "Classic",
      description: "Centered headline, pill search, and a simple list.",
    },
    {
      name: "Wordmark",
      description: "Brand-led search with compact competition shortcuts.",
    },
    {
      name: "Soft panel",
      description: "A quiet teal search area above recent competitions.",
    },
    {
      name: "Quick access",
      description: "Compact search with a two-column competition grid.",
    },
    {
      name: "Compact",
      description: "Search and recent competitions in one contained surface.",
    },
  ];
  const selected = $derived(
    Math.max(
      0,
      Math.min(
        4,
        Number.parseInt(page.url.searchParams.get("v") ?? "1", 10) - 1 || 0,
      ),
    ),
  );
  const competitions = createQuery(() => ({
    queryKey: ["competitions"],
    queryFn: () => api.getCompetitions(),
  }));
  const recent = $derived(
    [...(competitions.data ?? [])]
      .sort((a, b) => b.Date.localeCompare(a.Date))
      .slice(0, 4),
  );
  let search = $state<SearchForm>();
</script>

<svelte:head
  ><title>Livetila – Design previews</title><meta
    name="robots"
    content="noindex"
  /></svelte:head
>

<nav class="design-picker" aria-label="Design options">
  <span class="picker-label">Home explorations</span>
  <div class="option-links">
    {#each options as option, index (option.name)}
      <a
        href={`?v=${index + 1}`}
        aria-current={selected === index ? "page" : undefined}
        >{index + 1}. {option.name}</a
      >
    {/each}
  </div>
  <p>{options[selected]?.description}</p>
</nav>

{#key selected}
  <main class={`concept concept-${selected + 1}`}>
    <div class="layout">
      <section class="hero" aria-labelledby="concept-title">
        {#if selected === 1}
          <div class="wordmark" aria-hidden="true">live<span>tila</span></div>
        {/if}
        <h1 id="concept-title">Kilpailun jokainen <span>hetki.</span></h1>
        <p class="intro">
          Yleisurheilun tulokset.<br class="intro-break" /> Kentän laidalta kotikatsomoon.
        </p>
        <div class="search"><SearchForm bind:this={search} /></div>
      </section>
      <section class="recent" aria-labelledby="recent-title">
        <h2 id="recent-title">Viimeisimmät kilpailut</h2>
        {#if competitions.isPending}<p class="status" role="status">
            Ladataan kilpailuja…
          </p>
        {:else if competitions.isError}<button
            class="status retry"
            onclick={() => competitions.refetch()}
            >Lataa kilpailut uudelleen</button
          >
        {:else if !recent.length}<p class="status">
            Kilpailuja ei ole vielä saatavilla.
          </p>
        {:else}
          <ul>
            {#each recent as competition (competition.Id)}
              <li>
                <button onclick={() => search?.selectCompetition(competition)}>
                  <time datetime={competition.Date}
                    >{new Date(competition.Date).toLocaleDateString("fi-FI", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}</time
                  >
                  <span class="competition-name">{competition.Name}</span>
                  <svg
                    class="chevron"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg
                  >
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </section>
    </div>
  </main>
{/key}
<footer class="preview-footer">
  <span>Livetila</span><a href="https://live.tuloslista.com"
    >Tulostiedot: Tuloslista</a
  >
</footer>

<style>
  .design-picker {
    padding: 0.75rem 2rem;
    border-block: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 1.5rem;
  }
  .picker-label {
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  .option-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .option-links a {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8125rem;
  }
  .option-links a[aria-current] {
    background: var(--foreground);
    color: var(--background);
  }
  .design-picker p {
    width: 100%;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  .concept {
    flex: 1;
    padding: 3.5rem 1.25rem 3rem;
    --wash: color-mix(in srgb, var(--primary) 7%, var(--background));
  }
  .layout {
    max-width: 640px;
    margin-inline: auto;
  }
  .hero {
    text-align: center;
    position: relative;
    z-index: 2;
  }
  h1 {
    font-size: clamp(2.25rem, 4vw, 3.25rem);
    font-weight: 600;
    letter-spacing: -0.055em;
    line-height: 1.12;
    max-width: 16ch;
    margin: 0 auto;
    text-wrap: balance;
  }
  h1 span {
    color: var(--primary);
  }
  .intro {
    margin: 1.25rem 0 2rem;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    line-height: 1.7;
  }
  .recent {
    margin: 2.5rem 0.5rem 0;
  }
  h2 {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--muted-foreground);
    margin-bottom: 0.75rem;
  }
  .recent li + li {
    border-top: 1px solid var(--border);
  }
  .recent li button {
    display: grid;
    grid-template-columns: 5rem 1fr 1rem;
    gap: 1rem;
    align-items: center;
    width: 100%;
    min-height: 64px;
    padding: 0.875rem 0.5rem;
    border-radius: 8px;
    text-align: left;
    cursor: pointer;
  }
  time {
    font-size: 0.6875rem;
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
  }
  .competition-name {
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .chevron {
    color: var(--muted-foreground);
  }
  .status {
    padding: 1rem 0;
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
  .retry {
    text-decoration: underline;
  }
  .wordmark {
    font-size: clamp(4rem, 8vw, 5.5rem);
    font-weight: 700;
    letter-spacing: -0.075em;
    line-height: 1;
    margin-bottom: 1.25rem;
  }
  .wordmark span {
    color: var(--primary);
  }
  .concept-2 {
    padding-top: 3rem;
  }
  .concept-2 h1 {
    font-size: 1.0625rem;
    letter-spacing: -0.025em;
    max-width: none;
    font-weight: 500;
  }
  .concept-2 h1 span {
    color: inherit;
  }
  .concept-2 .intro {
    margin: 0.5rem 0 1.75rem;
    font-size: 0.8125rem;
  }
  .concept-2 .intro-break {
    display: none;
  }
  .concept-2 .recent {
    margin-top: 2rem;
  }
  .concept-2 ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .concept-2 .recent li + li {
    border: 0;
  }
  .concept-2 .recent li button {
    background: var(--muted);
    grid-template-columns: 1fr;
    gap: 0.25rem;
    padding: 1rem;
    min-height: 100px;
    align-content: start;
  }
  .concept-2 .chevron {
    display: none;
  }
  .concept-3 .layout {
    max-width: 760px;
  }
  .concept-3 .hero {
    padding: 2.5rem 2rem 2rem;
    background: var(--wash);
    border-radius: 24px;
  }
  .concept-3 h1 {
    font-size: clamp(2.25rem, 4vw, 3rem);
  }
  .concept-3 .recent {
    max-width: 640px;
    margin-inline: auto;
    padding-inline: 0.5rem;
  }
  .concept-4 .layout {
    max-width: 720px;
  }
  .concept-4 h1 {
    max-width: none;
    font-size: clamp(1.75rem, 3.5vw, 2.75rem);
  }
  .concept-4 .intro {
    margin: 0.875rem 0 1.75rem;
  }
  .concept-4 .intro-break {
    display: none;
  }
  .concept-4 .recent {
    margin-top: 2.75rem;
  }
  .concept-4 ul {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .concept-4 .recent li {
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .concept-4 .recent li button {
    grid-template-columns: 1fr 1rem;
    gap: 0.5rem;
    padding: 1.125rem;
    min-height: 116px;
  }
  .concept-4 time {
    grid-column: 1 / -1;
    color: var(--primary);
  }
  .concept-5 .layout {
    max-width: 680px;
    padding: 2rem;
    border-radius: 20px;
    background: var(--card);
    box-shadow:
      0 0 0 1px var(--border),
      0 12px 40px #00000008;
  }
  .concept-5 h1 {
    font-size: clamp(1.75rem, 3vw, 2.25rem);
    max-width: none;
  }
  .concept-5 .intro {
    font-size: 0.8125rem;
    margin: 0.75rem 0 1.5rem;
  }
  .concept-5 .recent {
    border-top: 1px solid var(--border);
    padding-top: 1.5rem;
    margin: 1.5rem 0 0;
  }
  .concept-5 .recent li button {
    min-height: 60px;
  }
  .preview-footer {
    display: flex;
    justify-content: space-between;
    padding: 1.25rem 2rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  .preview-footer a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }
  @media (hover: hover) and (pointer: fine) {
    .recent li button:hover {
      background: var(--wash);
    }
  }
  @media (max-width: 540px) {
    .design-picker {
      padding: 0.75rem 1rem;
      gap: 0.5rem;
    }
    .picker-label {
      width: 100%;
    }
    .option-links a {
      padding: 0.5rem;
      font-size: 0.75rem;
    }
    .concept {
      padding: 2rem 1.25rem;
    }
    .recent li button {
      grid-template-columns: 1fr 1rem;
      gap: 0.25rem 0.75rem;
    }
    .recent time {
      grid-column: 1;
      grid-row: 2;
    }
    .recent .chevron {
      grid-column: 2;
      grid-row: 1 / 3;
    }
    .concept-2 .recent li button {
      grid-template-columns: 1fr;
      padding: 0.75rem;
    }
    .concept-2 .recent time {
      grid-row: 1;
    }
    .concept-3 {
      padding-inline: 0.75rem;
    }
    .concept-3 .hero {
      padding: 2rem 0.75rem 1.5rem;
      border-radius: 16px;
    }
    .concept-3 .recent {
      padding-inline: 0.5rem;
    }
    .concept-4 ul {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
    .concept-4 .recent li button {
      min-height: 80px;
      padding: 0.875rem;
    }
    .concept-4 time {
      grid-column: 1;
      grid-row: 2;
    }
    .concept-5 {
      padding: 1.5rem 0.75rem;
    }
    .concept-5 .layout {
      padding: 1.5rem 0.75rem;
      border-radius: 16px;
    }
    .concept-5 h1 {
      max-width: 16ch;
    }
    .preview-footer {
      padding: 1.25rem;
    }
  }
</style>
