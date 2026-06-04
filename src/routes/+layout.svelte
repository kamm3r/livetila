<script lang="ts">
  import "../app.css";
  import { browser } from "$app/environment";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  });
  let { children } = $props();
</script>

<svelte:head>
  <title>Livetila</title>

  <meta
    name="description"
    content="live.tuloslista API, live result overlay for Live streams"
  />

  <link rel="icon" href="/favicon.ico" />
</svelte:head>

<QueryClientProvider client={queryClient}>
  {@render children()}
</QueryClientProvider>
