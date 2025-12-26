"use client";
import { createContext, type ReactNode, useContext } from "react";
import { useEventRounds } from "~/@/hooks/use-event-rounds";
import type { Heat, Round } from "~/types/comp";

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

export function useRound() {
	const context = useContext(RoundContext);
	if (context === undefined) {
		throw new Error("useEvent must be used within an EventProvider");
	}
	return context;
}
