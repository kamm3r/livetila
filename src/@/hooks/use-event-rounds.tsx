"use client";

import { useCallback, useMemo, useState } from "react";
import type { Heat, Round } from "~/types/comp";

export interface EventRoundsState {
	selectedRound: number;
	selectedHeat: number;
	currentRound: Round | undefined;
	currentHeat: Heat | undefined;
	heats: Heat[];
	showHeatNumbers: boolean;
	availableRounds: number[];
	availableHeats: number[];
	handleRoundChange: (roundIndex: number) => void;
	handleHeatChange: (heatIndex: number) => void;
}

export function useEventRounds(rounds: Round[]): EventRoundsState {
	const initialRoundIndex = useMemo(() => {
		if (rounds.length === 0) {
			return 0;
		}
		return rounds[rounds.length - 1]?.Index ?? 0;
	}, [rounds]);

	const [selectedRound, setSelectedRound] = useState<number>(initialRoundIndex);
	const [selectedHeat, setSelectedHeat] = useState<number>(1);

	const currentRound = useMemo(
		() => rounds.find((round) => round.Index === selectedRound) ?? rounds[0],
		[rounds, selectedRound],
	);

	const heats = currentRound?.Heats ?? [];

	const currentHeat = useMemo(
		() => heats.find((heat) => heat.Index === selectedHeat) ?? heats[0],
		[heats, selectedHeat],
	);

	const showHeatNumbers = heats.length >= 2;

	const availableRounds = useMemo(
		() => rounds.map((round) => round.Index),
		[rounds],
	);

	const availableHeats = useMemo(
		() => heats.map((heat) => heat.Index),
		[heats],
	);

	const handleRoundChange = useCallback(
		(roundIndex: number) => {
			const round = rounds.find((r) => r.Index === roundIndex);
			if (!round) {
				console.error(`Invalid round index: ${roundIndex}`);
				return;
			}

			setSelectedRound(roundIndex);
			setSelectedHeat(round?.Heats?.[0]?.Index ?? 1);
		},
		[rounds],
	);

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

	return {
		selectedRound,
		selectedHeat,
		currentRound,
		currentHeat,
		heats,
		showHeatNumbers,
		availableRounds,
		availableHeats,
		handleRoundChange,
		handleHeatChange,
	};
}
