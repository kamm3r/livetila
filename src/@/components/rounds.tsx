"use client";

import { useRound } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
import { useEventRounds } from "~/@/hooks/use-event-rounds";
import { type Competition } from "~/types/comp";

export function Rounds({ eventData }: { eventData: Competition }) {
  const { selectedRound, handleRoundChange } = useRound();

  if (eventData.Rounds.length <= 1) {
    return null;
  }
  return (
    <div className="flex gap-1">
      {eventData.Rounds.map((round) => (
        <Button
          key={round.Index}
          variant={selectedRound === round.Index ? "default" : "outline"}
          onClick={() => handleRoundChange(round.Index)}
          size="sm"
        >
          {round.Name}
        </Button>
      ))}
    </div>
  );
}
