<script lang="ts">
  import { page } from "$app/state";
  import SearchForm from "$lib/components/search-form.svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import { api } from "$lib/api";

  const options = [
    { name: "Poster", description: "Suuri typografia, haku etualalla." },
    {
      name: "Split",
      description: "Vahva väripinta ja rauhallinen hakunäkymä.",
    },
    {
      name: "Spotlight",
      description: "Keskitetty haku värillisellä taustalla.",
    },
    {
      name: "Editorial",
      description: "Toimituksellinen typografia ja epäsymmetrinen asettelu.",
    },
    {
      name: "Directory",
      description: "Kilpailut heti näkyvissä, haku käden ulottuvilla.",
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
      .slice(0, 5),
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
    {#if selected === 0}
      <section class="poster">
        <h1>Kilpailun<br />jokainen<br /><span>hetki.</span></h1>
        <div class="poster-bottom">
          <p>Yleisurheilun tulokset.<br />Kentän laidalta kotikatsomoon.</p>
          <div class="search-panel"><SearchForm /></div>
        </div>
      </section>
    {:else if selected === 1}
      <section class="split">
        <div class="split-title">
          <h1>Siinä<br />hetkessä.<br />Mukana.</h1>
          <p>Yleisurheilun eräjaot ja tulokset,<br />suoritus kerrallaan.</p>
        </div>
        <div class="split-search">
          <h2>Mitä kilpailua<br />seuraat?</h2>
          <SearchForm />
          <p>
            Valitse kilpailu ja laji.<br />Tulokset päivittyvät kilpailun
            mukana.
          </p>
        </div>
      </section>
    {:else if selected === 2}
      <section class="spotlight">
        <h1>Kentän laidalla.<br />Missä tahansa.</h1>
        <div class="spotlight-card">
          <h2>Löydä kilpailusi.</h2>
          <p>Eräjaot, suoritukset ja sijoitukset yhdessä näkymässä.</p>
          <SearchForm />
        </div>
        <p class="spotlight-caption">Yleisurheilun tulokset Livetilassa.</p>
      </section>
    {:else if selected === 3}
      <section class="editorial">
        <h1>Jokainen<br /><em>suoritus</em><br />merkitsee.</h1>
        <div class="editorial-search">
          <p>Kilpailu elää hetkessä.<br />Seuraa sitä tulos tulokselta.</p>
          <SearchForm /><span>Yleisurheilun tulokset ja eräjaot.</span>
        </div>
      </section>
    {:else}
      <section class="directory">
        <div class="directory-heading">
          <h1>Oma lajisi.<br />Oma kilpailusi.</h1>
          <p>Löydä tulokset.</p>
        </div>
        <div class="directory-body">
          <div class="directory-search"><SearchForm bind:this={search} /></div>
          <div class="directory-list">
            <h2>Viimeisimmät kilpailut</h2>
            {#if competitions.isPending}<p role="status">
                Ladataan kilpailuja…
              </p>
            {:else if competitions.isError}<button
                onclick={() => competitions.refetch()}
                >Lataa kilpailut uudelleen</button
              >
            {:else if !recent.length}<p>Kilpailuja ei ole vielä saatavilla.</p>
            {:else}<ul>
                {#each recent as competition (competition.Id)}<li>
                    <button
                      onclick={() => search?.selectCompetition(competition)}
                      ><time datetime={competition.Date}
                        >{new Date(competition.Date).toLocaleDateString(
                          "fi-FI",
                        )}</time
                      ><span>{competition.Name}</span><span aria-hidden="true"
                        >↗</span
                      ></button
                    >
                  </li>{/each}
              </ul>{/if}
          </div>
        </div>
      </section>
    {/if}
  </main>
{/key}
<footer class="preview-footer">
  <span>Livetila</span><a href="https://live.tuloslista.com"
    >Tulostiedot: Tuloslista</a
  >
</footer>

<style>
  .design-picker {
    padding: 1rem 2rem;
    border-block: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 2rem;
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
    --teal: #00b3c7;
    --deep: #003b43;
    flex: 1;
  }
  :global(.dark) .concept {
    --teal: #20d0df;
  }
  .concept h1 {
    letter-spacing: -0.065em;
    font-weight: 650;
  }
  .concept p {
    line-height: 1.65;
  }
  .preview-footer {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem 2rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  .preview-footer a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .poster {
    max-width: 1200px;
    margin: auto;
    padding: 3rem 2rem;
  }
  .poster h1 {
    color: var(--teal);
    font-size: clamp(5rem, 10vw, 9rem);
    line-height: 0.86;
  }
  .poster h1 span {
    color: var(--foreground);
  }
  .poster-bottom {
    margin-top: 2.5rem;
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    align-items: start;
    gap: 2rem;
  }
  .poster-bottom p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
  }
  .search-panel {
    padding-top: 0.25rem;
  }
  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 650px;
  }
  .split-title {
    background: var(--teal);
    color: var(--deep);
    padding: 4rem clamp(2rem, 6vw, 6rem);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 3rem;
  }
  .split h1 {
    font-size: clamp(3.75rem, 6.5vw, 6.5rem);
    line-height: 0.98;
  }
  .split-search {
    padding: 4rem clamp(2rem, 5vw, 5rem);
    align-self: center;
    min-width: 0;
  }
  .split-search h2 {
    font-size: clamp(2rem, 3vw, 3rem);
    line-height: 1.15;
    letter-spacing: -0.04em;
    margin-bottom: 2rem;
    font-weight: 550;
  }
  .split-search > p {
    margin-top: 1.5rem;
    font-size: 0.8125rem;
    color: var(--muted-foreground);
  }
  .spotlight {
    margin: 1.5rem;
    border-radius: 28px;
    background: var(--teal);
    color: var(--deep);
    padding: 3.5rem 1.5rem 2rem;
    text-align: center;
    min-height: 620px;
  }
  .spotlight h1 {
    font-size: clamp(2.75rem, 5.5vw, 5.25rem);
    line-height: 1.02;
  }
  .spotlight-card {
    position: relative;
    background: var(--background);
    color: var(--foreground);
    max-width: 680px;
    margin: 2.5rem auto 0;
    border-radius: 20px;
    padding: 2rem;
    text-align: left;
    box-shadow: 0 20px 50px #003b4320;
  }
  .spotlight-card h2 {
    font-size: 1.5rem;
    font-weight: 550;
    letter-spacing: -0.04em;
  }
  .spotlight-card > p {
    font-size: 0.875rem;
    color: var(--muted-foreground);
    margin: 0.5rem 0 1.5rem;
  }
  .spotlight-caption {
    margin-top: 1.5rem;
    font-size: 0.75rem;
  }
  .editorial {
    max-width: 1200px;
    margin: auto;
    padding: 4rem 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: end;
  }
  .editorial h1 {
    font-family: Georgia, "Times New Roman", serif;
    font-weight: 400;
    font-size: clamp(4rem, 7vw, 7rem);
    line-height: 1.04;
    letter-spacing: -0.065em;
  }
  .editorial em {
    color: var(--teal);
    font-weight: 400;
  }
  .editorial-search {
    min-width: 0;
    padding-bottom: 1rem;
  }
  .editorial-search > p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }
  .editorial-search > span {
    display: block;
    margin-top: 1.25rem;
    font-size: 0.75rem;
    color: var(--muted-foreground);
  }
  .directory {
    max-width: 1120px;
    margin: auto;
    padding: 3rem 2rem;
  }
  .directory-heading {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 2rem;
    margin-bottom: 2.5rem;
  }
  .directory-heading h1 {
    font-size: clamp(2.75rem, 5vw, 4.5rem);
    line-height: 1.05;
  }
  .directory-heading > p {
    color: var(--teal);
    font-size: 1.25rem;
  }
  .directory-body {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 2rem;
    align-items: start;
  }
  .directory-search {
    border-top: 5px solid var(--teal);
    padding-top: 1.5rem;
    min-width: 0;
  }
  .directory-list {
    min-width: 0;
    padding: 1.5rem;
    background: var(--card);
    border-radius: 16px;
    border: 1px solid var(--border);
  }
  .directory-list h2 {
    font-weight: 600;
    margin-bottom: 1rem;
  }
  .directory-list li + li {
    border-top: 1px solid var(--border);
  }
  .directory-list li button {
    width: 100%;
    display: grid;
    grid-template-columns: 5rem 1fr 1rem;
    gap: 1rem;
    text-align: left;
    align-items: center;
    padding: 1.125rem 0;
    font-size: 0.875rem;
    cursor: pointer;
  }
  .directory-list time {
    font-size: 0.6875rem;
    color: var(--muted-foreground);
  }
  .directory-list li button:hover {
    color: var(--teal);
  }
  .directory-list li button span {
    overflow-wrap: anywhere;
  }
  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 3px;
  }
  @media (max-width: 700px) {
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
    .poster,
    .editorial,
    .directory {
      padding: 2.5rem 1.25rem;
    }
    .poster-bottom,
    .split,
    .editorial,
    .directory-body {
      grid-template-columns: minmax(0, 1fr);
    }
    .poster h1 {
      font-size: clamp(4.5rem, 17vw, 7rem);
    }
    .split-title {
      padding: 2rem 1.5rem;
      gap: 1.5rem;
    }
    .split-search {
      padding: 2rem 1.25rem;
    }
    .split h1 {
      font-size: 3.75rem;
    }
    .spotlight {
      margin: 0.75rem;
      padding: 2.5rem 0.75rem 1.5rem;
      border-radius: 18px;
      min-height: 0;
    }
    .spotlight-card {
      padding: 1.25rem 0.75rem;
      margin-top: 2rem;
    }
    .spotlight h1 {
      font-size: 2.75rem;
    }
    .editorial {
      gap: 2rem;
    }
    .editorial h1 {
      font-size: 4.25rem;
    }
    .directory-heading {
      display: block;
    }
    .directory-heading > p {
      margin-top: 1rem;
    }
    .directory-list {
      padding: 1rem;
    }
    .directory-list li button {
      gap: 0.5rem;
      grid-template-columns: 4.5rem 1fr 1rem;
    }
    .preview-footer {
      padding: 1.25rem;
    }
  }
</style>
