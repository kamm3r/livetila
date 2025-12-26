"use client";

import { useCallback, useMemo, useState } from "react";
import type { Round } from "~/types/comp";

export function useEventRounds(rounds: Round[]) {
	const initialRoundIndex = useMemo(() => {
		if (rounds.length === 0) {
			return 0;
		}
		return rounds[rounds.length - 1]?.Index ?? 0;
	}, [rounds]);

	const [selectedRound, setSelectedRound] = useState<number>(initialRoundIndex);
	const [selectedHeat, setSelectedHeat] = useState<number>(1);

	// Get the current round
	const currentRound = useMemo(() => {
		if (rounds.length === 0) return undefined;
		return rounds.find((round) => round.Index === selectedRound) ?? rounds[0];
	}, [rounds, selectedRound]);

	// Get heats for the current round
	const heats = useMemo(() => {
		return currentRound?.Heats ?? [];
	}, [currentRound]);

	// Get the current heat
	const currentHeat = useMemo(() => {
		if (heats.length === 0) return undefined;
		return heats.find((heat) => heat.Index === selectedHeat) ?? heats[0];
	}, [heats, selectedHeat]);

	// Determine if we should show heat numbers (only when there are 2 or more heats)
	const showHeatNumbers = useMemo(() => heats.length >= 2, [heats]);

	// Handle round change with a callback to reset heat selection
	const handleRoundChange = useCallback(
		(roundIndex: number) => {
			if (!rounds.some((round) => round.Index === roundIndex)) {
				console.error(`Invalid round index: ${roundIndex}`);
				return;
			}
			setSelectedRound(roundIndex);

			// Find the selected round and get its first heat index if available
			const round = rounds.find((r) => r.Index === roundIndex);
			const firstHeatIndex = round?.Heats?.[0]?.Index ?? 1;
			setSelectedHeat(firstHeatIndex);
		},
		[rounds],
	);

	// Handle heat change
	const handleHeatChange = useCallback(
		(heatIndex: number) => {
			if (!heats.some((heat) => heat.Index === heatIndex)) {
				console.error(`Invalid heat index: ${heatIndex}`);
				return;
			}
			setSelectedHeat(heatIndex);
		},
		[heats],
	);

	// Add a utility function to get all available round indexes
	const availableRounds = useMemo(() => {
		return rounds.map((round) => round.Index);
	}, [rounds]);

	// Add a utility function to get all available heat indexes for the current round
	const availableHeats = useMemo(() => {
		return heats.map((heat) => heat.Index);
	}, [heats]);

	return {
		selectedRound,
		selectedHeat,
		currentRound,
		currentHeat,
		heats,
		showHeatNumbers,
		handleRoundChange,
		handleHeatChange,
		availableRounds,
		availableHeats,
		isLoading: rounds.length === 0,
	};
}
