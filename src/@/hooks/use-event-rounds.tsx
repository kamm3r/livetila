"use client";

import { useState, useCallback } from "react";
import { type Round } from "~/types/comp";

export function useEventRounds(rounds: Round[]) {
  const [selectedRound, setSelectedRound] = useState<number>(
    rounds.length > 0 ? rounds[rounds.length - 1].Index : 0,
  );
  const [selectedHeat, setSelectedHeat] = useState<number>(1);

  // Get the current round
  const currentRound =
    rounds.find((round) => round.Index === selectedRound) ?? rounds[0];

  // Get heats for the current round
  const heats = currentRound?.Heats ?? [];

  // Get the current heat
  const currentHeat =
    heats.find((heat) => heat.Index === selectedHeat) ?? heats[0];

  // Determine if we should show heat numbers (only when there are 2 or more heats)
  const showHeatNumbers = heats.length >= 2;

  // Handle round change with a callback to reset heat selection
  const handleRoundChange = useCallback((roundIndex: number) => {
    setSelectedRound(roundIndex);
    setSelectedHeat(1); // Reset to first heat when changing rounds
  }, []);

  // Handle heat change
  const handleHeatChange = useCallback((heatIndex: number) => {
    setSelectedHeat(heatIndex);
  }, []);

  return {
    selectedRound,
    selectedHeat,
    currentRound,
    currentHeat,
    heats,
    showHeatNumbers,
    handleRoundChange,
    handleHeatChange,
  };
}
