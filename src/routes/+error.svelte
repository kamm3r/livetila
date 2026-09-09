<script lang="ts">
  import { page } from "$app/state";
</script>

<div class="flex min-h-screen flex-col items-center justify-center text-center">
  <a href="/" class="text-secondary-foreground underline">Home</a>
  <div class="flex flex-col">
    <h1 class="font-bold text-9xl">{page.status}</h1>
    <h2 class="font-bold text-4xl">Page not found</h2>
  </div>
</div>
