<script module lang="ts">
  import { getContext, setContext } from "svelte";
  import type { Heat, Round } from "~/types/comp";

  const ROUND_CONTEXT_KEY = Symbol("round-provider");

  export type RoundContext = {
    rounds: Round[];
    selectedRound: number;
    selectedHeat: number;
    currentRound: Round;
    currentHeat: Heat;
    heats: Heat[];
    showHeatNumbers: boolean;
    handleRoundChange: (index: number) => void;
    handleHeatChange: (index: number) => void;
  };

  export function getRoundContext(): RoundContext {
    return getContext(ROUND_CONTEXT_KEY);
  }
</script>

<script lang="ts">
  import { triggerHaptic } from "$lib/hooks/use-haptics";

  let {
    rounds = [],
    children,
  }: {
    rounds: Round[];
    children: import("svelte").Snippet;
  } = $props();

  let selectedRound = $state(0);
  let selectedHeat = $state(1);

  $effect(() => {
    if (rounds.length > 0 && selectedRound === 0) {
      selectedRound = rounds.at(-1)?.Index ?? 0;
    }
  });

  const currentRound = $derived(
    rounds.find((r) => r.Index === selectedRound) ?? rounds[0],
  );
  const heats = $derived(currentRound?.Heats ?? []);
  const currentHeat = $derived(
    heats.find((h) => h.Index === selectedHeat) ?? heats[0],
  );
  const showHeatNumbers = $derived(heats.length >= 2);

  function handleRoundChange(index: number) {
    triggerHaptic("selection");
    selectedRound = index;
    const round = rounds.find((r) => r.Index === index);
    selectedHeat = round?.Heats?.[0]?.Index ?? 1;
  }

  function handleHeatChange(index: number) {
    if (heats.some((h) => h.Index === index)) {
      triggerHaptic("selection");
      selectedHeat = index;
    }
  }

  setContext(ROUND_CONTEXT_KEY, {
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
