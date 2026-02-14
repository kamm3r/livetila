"use client";
import { createContext, type ReactNode, use } from "react";
import {
	type RoundContextValue,
	useEventRounds,
} from "~/@/hooks/use-event-rounds";
import type { Round } from "~/types/comp";

const RoundContext = createContext<RoundContextValue | undefined>(undefined);
RoundContext.displayName = "RoundContext";

interface RoundProviderProps {
	children: ReactNode;
	rounds: Round[];
}

export function RoundProvider({ children, rounds }: RoundProviderProps) {
	const roundsState = useEventRounds(rounds);

	return <RoundContext value={roundsState}>{children}</RoundContext>;
}

export function useRound() {
	const context = use(RoundContext);
	if (context === undefined) {
		throw new Error("useRound must be used within a RoundProvider");
	}
	return context;
}
