<script lang="ts">
  import { page } from "$app/state";
  import { ModeWatcher } from "mode-watcher";
  import Navbar from "$lib/components/navbar.svelte";
</script>

<ModeWatcher defaultMode="system" modeStorageKey="theme" disableTransitions />

<div class="flex min-h-dvh flex-col">
  <Navbar />
  <main
    class="flex flex-1 flex-col items-center justify-center gap-2 px-4 pb-14 text-center"
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
</div>
