"use client";
import { createContext, type ReactNode, useContext } from "react";
import {
	type EventRoundsState,
	useEventRounds,
} from "~/@/hooks/use-event-rounds";
import type { Round } from "~/types/comp";

const RoundContext = createContext<EventRoundsState | undefined>(undefined);
RoundContext.displayName = "RoundContext";

interface RoundProviderProps {
	children: ReactNode;
	rounds: Round[];
}

export function RoundProvider({ children, rounds }: RoundProviderProps) {
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
