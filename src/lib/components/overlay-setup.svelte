<script lang="ts">
  // How to add the overlay link in common broadcast tools. The overlay is
  // laid out for a 1280×720 page with a transparent background.
  import { cn } from "$lib/utils";

  const tools = [
    {
      name: "OBS Studio",
      steps: [
        "Lähteet → + → Selain (Browser).",
        "Liitä linkki URL-kenttään.",
        "Leveys 1280 ja korkeus 720.",
        "Jätä ”Shutdown source when not visible” pois päältä, niin tulokset ovat ajan tasalla heti kun lähde näytetään.",
        "Sovita lähde koko kuvaan: hiiren oikea → Muunna → Sovita näyttöön (Ctrl+F).",
      ],
    },
    {
      name: "Streamlabs",
      steps: [
        "Sources → + → Browser Source.",
        "Liitä linkki URL-kenttään.",
        "Leveys 1280 ja korkeus 720.",
        "Jätä ”Shutdown source when not visible” pois päältä.",
        "Venytä lähde koko kuvan kokoiseksi.",
      ],
    },
    {
      name: "vMix",
      steps: [
        "Add Input → Web Browser.",
        "Liitä linkki ja aseta kooksi 1280×720.",
        "Näytä input overlay-kanavalla, esim. Overlay 1.",
      ],
    },
  ];
  let selected = $state(0);
</script>

<details class="group rounded-lg border text-sm">
  <summary
    class="cursor-pointer select-none px-3 py-2 font-medium outline-none focus-visible:outline-2 focus-visible:outline-primary"
  >
    Asetukset lähetysohjelmassa
  </summary>
  <div class="flex flex-col gap-3 px-3 pb-3">
    <div class="flex gap-1" role="group" aria-label="Ohjelma">
      {#each tools as tool, i (tool.name)}
        <button
          type="button"
          aria-pressed={selected === i}
          onclick={() => (selected = i)}
          class={cn(
            "rounded-md px-2 py-1 text-muted-foreground text-xs hover:bg-muted",
            selected === i && "bg-muted text-foreground",
          )}
        >
          {tool.name}
        </button>
      {/each}
    </div>
    <ol class="flex list-decimal flex-col gap-1 pl-5 text-muted-foreground">
      {#each tools[selected]!.steps as step (step)}
        <li>{step}</li>
      {/each}
    </ol>
    <p class="text-muted-foreground text-xs">
      Tausta on valmiiksi läpinäkyvä, ja animaatiot toimivat sekä 30 että 60
      fps:n lähetyksessä, joten kuvataajuutta ei tarvitse muuttaa. Muissa
      ohjelmissa käytä selainlähdettä (browser source) samalla koolla.
    </p>
  </div>
</details>
