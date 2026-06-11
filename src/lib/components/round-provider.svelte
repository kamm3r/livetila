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
  import { triggerHaptic } from "$lib/hooks/use-haptics";

  let {
    rounds = [],
    initialRound,
    children,
  }: {
    rounds: Round[];
    initialRound?: number;
    children: Snippet;
  } = $props();

  let selectedRound = $state(-1);
  let selectedHeat = $state(-1);

  $effect(() => {
    if (rounds.length > 0 && (selectedRound === -1 || selectedHeat === -1)) {
      if (selectedRound === -1) {
        selectedRound =
          initialRound ?? rounds.at(-1)?.Index ?? rounds[0]?.Index ?? -1;
      }
      const round = rounds.find((r) => r.Index === selectedRound);
      if (round && selectedHeat === -1) {
        selectedHeat = round.Heats[0]?.Index ?? -1;
      }
    }
  });

  const currentRound = $derived(
    rounds.find((r) => r.Index === selectedRound) ?? rounds[0],
  );

  $effect(() => {
    const round = currentRound;
    if (round?.RoundTypeCategory && rounds.length > 1) {
      const url = new URL(window.location.href);
      if (url.searchParams.get("round") !== round.RoundTypeCategory) {
        url.searchParams.set("round", round.RoundTypeCategory);
        goto(url, { replaceState: true, noScroll: true, keepFocus: true });
      }
    }
  });

  const heats = $derived(currentRound?.Heats ?? []);
  const currentHeat = $derived(
    heats.find((h) => h.Index === selectedHeat) ?? heats[0],
  );
  const showHeatNumbers = $derived(heats.length >= 2);

  function handleRoundChange(index: number) {
    triggerHaptic("selection");
    selectedRound = index;
    const round = rounds.find((r) => r.Index === index);
    selectedHeat = round?.Heats?.[0]?.Index ?? -1;
  }

  function handleHeatChange(index: number) {
    if (heats.some((h) => h.Index === index)) {
      triggerHaptic("selection");
      selectedHeat = index;
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
