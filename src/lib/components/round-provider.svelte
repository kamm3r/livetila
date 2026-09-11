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
  import {
    selectCompetitionRound,
    competitionRoundLink,
    type HeatSelection,
  } from "$lib/competition-selection";
  import { goto } from "$app/navigation";
  import { createWebHaptics } from "web-haptics/svelte";
  import { onDestroy } from "svelte";

  let {
    rounds = [],
    roundCategory,
    children,
  }: {
    rounds: Round[];
    roundCategory?: string | null;
    children: Snippet;
  } = $props();

  let heatSelection = $state<HeatSelection | null>(null);
  const selection = $derived(
    selectCompetitionRound(rounds, roundCategory, heatSelection),
  );
  const currentRound = $derived(selection.round);
  const currentHeat = $derived(selection.heat);
  const selectedRound = $derived(currentRound?.Index ?? -1);
  const selectedHeat = $derived(currentHeat?.Index ?? -1);
  const heats = $derived(selection.heats);
  const showHeatNumbers = $derived(heats.length >= 2);

  const { trigger, destroy } = createWebHaptics();
  onDestroy(destroy);

  function handleRoundChange(index: number) {
    trigger();
    const url = competitionRoundLink(
      new URL(window.location.href),
      rounds,
      index,
    );
    if (!url) return;
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
