"use client";
import { createContext, type ReactNode, useContext } from "react";
import { useEventRounds } from "~/@/hooks/use-event-rounds";
import { type Heat, type Round } from "~/types/comp";

interface EventContextType {
  selectedRound: number;
  selectedHeat: number;
  currentRound: Round | undefined;
  currentHeat: Heat | undefined;
  heats: Heat[];
  showHeatNumbers: boolean;
  handleRoundChange: (roundIndex: number) => void;
  handleHeatChange: (heatIndex: number) => void;
}

const RoundContext = createContext<EventContextType | undefined>(undefined);

// Create a provider component
interface EventProviderProps {
  children: ReactNode;
  rounds: Round[];
}

export function RoundProvider({ children, rounds }: EventProviderProps) {
  const roundsState = useEventRounds(rounds);

  return (
    <RoundContext.Provider value={roundsState}>
      {children}
    </RoundContext.Provider>
  );
}

// Create a hook to use the context
export function useRound() {
  const context = useContext(RoundContext);
  if (context === undefined) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
}
