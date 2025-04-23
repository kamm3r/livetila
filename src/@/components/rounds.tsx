"use client";

import { useRound } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
import { type Competition } from "~/types/comp";

export function Rounds({ competition }: { competition: Competition }) {
  const { selectedRound, handleRoundChange } = useRound();

  if (competition.Rounds.length <= 1) {
    return null;
  }
  return (
    <div className="flex">
      {competition.Rounds.map((round) => (
        <Button
          key={round.Index}
          variant={selectedRound === round.Index ? "default" : "ghost"}
          onClick={() => handleRoundChange(round.Index)}
          size="sm"
          className="h-8 rounded-none px-3 text-xs md:text-sm"
        >
          {round.Name}
        </Button>
      ))}
    </div>
  );
}
