<script module lang="ts">
  import { createContext, type Snippet } from "svelte";
  import type { Heat, Round } from "~/types/comp";

  export type RoundContext = {
    rounds: Round[];
    selectedRound: number;
    selectedHeat: number;
    currentRound: Round | undefined;
    currentHeat: Heat | undefined;
    heats: Heat[];
    showHeatNumbers: boolean;
    handleRoundChange: (index: number) => void;
    handleHeatChange: (index: number) => void;
  };

  export const [getRoundContext, setRoundContext] =
    createContext<RoundContext>();
</script>

<script lang="ts">
  import { goto } from "$app/navigation";
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";

  let {
    rounds = [],
    initialRound,
    children,
  }: {
    rounds: Round[];
    initialRound?: number;
    children: Snippet;
  } = $props();

  const currentRound = $derived(
    rounds.find((r) => r.Index === initialRound) ?? rounds.at(-1),
  );
  const selectedRound = $derived(currentRound?.Index ?? -1);
  let heatSelection = $state<{ round: number; heat: number } | null>(null);
  const selectedHeat = $derived(
    heatSelection?.round === selectedRound &&
      currentRound?.Heats.some((h) => h.Index === heatSelection?.heat)
      ? heatSelection.heat
      : (currentRound?.Heats[0]?.Index ?? -1),
  );

  const heats = $derived(currentRound?.Heats ?? []);
  const currentHeat = $derived(
    heats.find((h) => h.Index === selectedHeat) ?? heats[0],
  );
  const showHeatNumbers = $derived(heats.length >= 2);

  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);

  function handleRoundChange(index: number) {
    trigger();
    const round = rounds.find((r) => r.Index === index);
    if (!round) return;
    const url = new URL(window.location.href);
    url.searchParams.set("round", round.RoundTypeCategory);
    void goto(url, { noScroll: true, keepFocus: true });
  }

  function handleHeatChange(index: number) {
    if (heats.some((h) => h.Index === index)) {
      trigger("selection");
      heatSelection = { round: selectedRound, heat: index };
    }
  }

  setRoundContext({
    get rounds() {
      return rounds;
    },
    get selectedRound() {
      return selectedRound;
    },
    get selectedHeat() {
      return selectedHeat;
    },
    get currentRound() {
      return currentRound;
    },
    get currentHeat() {
      return currentHeat;
    },
    get heats() {
      return heats;
    },
    get showHeatNumbers() {
      return showHeatNumbers;
    },
    handleRoundChange,
    handleHeatChange,
  });
</script>

{@render children()}
