<script module lang="ts">
  import { getContext, setContext } from "svelte";

  const RESULT_CONTEXT_KEY = Symbol("result-provider");

  export type ResultContext = {
    compId: string;
    isProgress: boolean;
    eventCategory: "Track" | "Field" | "Relay";
  };

  export function getResultContext(): ResultContext {
    return getContext(RESULT_CONTEXT_KEY);
  }
</script>

<script lang="ts">
  let {
    compId = "",
    isProgress = false,
    eventCategory = "Field",
    children,
  }: {
    compId: string;
    isProgress: boolean;
    eventCategory: "Track" | "Field" | "Relay";
    children: import("svelte").Snippet;
  } = $props();

  setContext(RESULT_CONTEXT_KEY, {
    get compId() {
      return compId;
    },
    get isProgress() {
      return isProgress;
    },
    get eventCategory() {
      return eventCategory;
    },
  });
</script>

{@render children()}
