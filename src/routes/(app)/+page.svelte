<script lang="ts">
  import SearchForm from "$lib/components/search-form.svelte";
  import { ArrowUpRight } from "@lucide/svelte";
</script>

<main class="home-page relative isolate flex-1 px-4 pb-16 sm:px-8">
  <div
    class="home-backdrop pointer-events-none absolute inset-0 -z-10"
    aria-hidden="true"
  ></div>
  <section
    class="mx-auto w-full max-w-2xl pt-16 sm:pt-24 lg:pt-28"
    aria-labelledby="home-title"
  >
    <div class="home-intro text-center">
      <p
        class="mb-5 inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase"
      >
        <span class="size-1.5 rounded-full bg-primary" aria-hidden="true"
        ></span>
        Yleisurheilun tulokset
      </p>
      <h1
        id="home-title"
        class="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl"
      >
        Mukana kilpailun<br />
        <span class="text-primary">jokaisessa hetkessä.</span>
      </h1>
      <p
        class="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground"
      >
        Löydä kilpailusi ja seuraa tuloksia reaaliajassa.<br
          class="hidden sm:block"
        />
        Kentän laidalta tai kotikatsomosta.
      </p>
    </div>

    <div class="mt-9 sm:mt-10">
      <div class="mb-3 flex items-center justify-between px-1 text-xs">
        <span class="font-medium text-foreground">Löydä kilpailusi</span>
        <span class="text-muted-foreground"
          >Kilpailu <span class="mx-1.5 opacity-40" aria-hidden="true">/</span>
          Laji <span class="mx-1.5 opacity-40" aria-hidden="true">/</span> Tulokset</span
        >
      </div>
      <SearchForm />
    </div>

    <p class="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
      Seuraa eräjakoja ja tuloksia. Tuo kilpailu myös omaan lähetykseesi
      OBS-overlaylla.
    </p>
  </section>
</main>

<footer
  class="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-5 py-5 text-xs text-muted-foreground sm:px-8"
>
  <span
    >Livetila <span class="mx-1.5 opacity-40" aria-hidden="true">/</span> Lähempänä
    kilpailua.</span
  >
  <a
    href="https://live.tuloslista.com"
    class="inline-flex items-center gap-1 hover:text-foreground"
  >
    Tulokset: Tuloslista <ArrowUpRight class="size-3" />
  </a>
</footer>

<style>
  .home-backdrop {
    background: radial-gradient(
      ellipse 55% 45% at 50% 12%,
      color-mix(in oklch, var(--primary) 7%, transparent),
      transparent
    );
  }

  .home-intro {
    animation: home-arrive 280ms var(--motion-ease-out) both;
  }

  @keyframes home-arrive {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
