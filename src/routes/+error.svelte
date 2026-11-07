<script lang="ts">
  import { page } from "$app/state";
</script>

<main
  class="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center"
>
  <p class="font-medium text-muted-foreground text-sm tabular-nums">
    {page.status}
  </p>
  <h1 class="font-semibold text-2xl tracking-tight">
    {page.status === 404 ? "Sivua ei löytynyt" : "Jokin meni pieleen"}
  </h1>
  <a
    href="/"
    class="mt-3 rounded-sm text-primary text-sm underline underline-offset-4"
    >Palaa etusivulle</a
  >
</main>
