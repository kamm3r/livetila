"use client";

import { useRound } from "~/@/components/round-provider";
import type { Round } from "~/types/comp";
import { Button } from "~/@/components/ui/button";

function roundLabel(round: Round) {
  switch (round.RoundTypeCategory) {
    case "Qualify":
      return "Alkuerät";
    case "Final":
      return "Loppukilpailu";
    default:
      return round.Name;
  }
}

export function RoundSwitcher() {
  const { rounds, selectedRound, handleRoundChange } = useRound();

  if (rounds.length <= 1) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {rounds.map((round) => (
        <Button
          key={round.Index}
          onClick={() => handleRoundChange(round.Index)}
          variant={selectedRound === round.Index ? "default" : "outline"}
        >
          {roundLabel(round)}
        </Button>
      ))}
    </div>
  );
}
