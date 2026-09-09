<script module lang="ts">
  import { createContext, type Snippet } from "svelte";

  export type ResultContext = {
    compId: string;
    isProgress: boolean;
    eventCategory: "Track" | "Field" | "Relay";
  };

  export const [getResultContext, setResultContext] =
    createContext<ResultContext>();
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
    children: Snippet;
  } = $props();

  setResultContext({
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
