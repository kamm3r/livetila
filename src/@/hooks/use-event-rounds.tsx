"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Heat, Round } from "~/types/comp";

export interface RoundState {
	selectedRound: number;
	selectedHeat: number;
	currentRound: Round | undefined;
	currentHeat: Heat | undefined;
	heats: Heat[];
	rounds: Round[];
}

export interface RoundActions {
	handleRoundChange: (roundIndex: number) => void;
	handleHeatChange: (heatIndex: number) => void;
}

export interface RoundMeta {
	showHeatNumbers: boolean;
	availableRounds: number[];
	availableHeats: number[];
}

export interface RoundContextValue {
	state: RoundState;
	actions: RoundActions;
	meta: RoundMeta;
}

function roundParamToIndex(rounds: Round[], param: string | null) {
	if (!param || rounds.length === 0) return null;
	return rounds.find((r) => r.RoundTypeCategory === param)?.Index ?? null;
}

function getDefaultRoundIndex(rounds: Round[]) {
	return rounds.at(-1)?.Index ?? 0;
}

function getFirstHeatIndex(rounds: Round[], roundIndex: number): number {
	return rounds.find((r) => r.Index === roundIndex)?.Heats?.[0]?.Index ?? 1;
}

export function useEventRounds(rounds: Round[]): RoundContextValue {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const roundParam = searchParams.get("round");
	const roundFromUrl = roundParamToIndex(rounds, roundParam);

	const [selectedRound, setSelectedRound] = useState<number>(
		() => roundFromUrl ?? getDefaultRoundIndex(rounds),
	);
	const [selectedHeat, setSelectedHeat] = useState<number>(1);

	// Sync with URL changes
	useEffect(() => {
		if (roundFromUrl != null && roundFromUrl !== selectedRound) {
			setSelectedRound(roundFromUrl);
			setSelectedHeat(getFirstHeatIndex(rounds, roundFromUrl));
		}
	}, [roundFromUrl, selectedRound, rounds]);

	// Sync with rounds data changes
	useEffect(() => {
		if (rounds.length > 0 && selectedRound === 0 && roundFromUrl == null) {
			const defaultIndex = getDefaultRoundIndex(rounds);
			setSelectedRound(defaultIndex);
			setSelectedHeat(getFirstHeatIndex(rounds, defaultIndex));
		}
	}, [rounds, selectedRound, roundFromUrl]);

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
			if (!round) return;

			const params = new URLSearchParams(searchParams.toString());
			const param = round.RoundTypeCategory;

			if (param) {
				params.set("round", param);
			} else {
				params.delete("round");
			}

			router.replace(`${pathname}?${params.toString()}`, { scroll: false });
			setSelectedRound(roundIndex);
			setSelectedHeat(round.Heats?.[0]?.Index ?? 1);
		},
		[rounds, searchParams, router, pathname],
	);

	const handleHeatChange = useCallback(
		(heatIndex: number) => {
			if (heats.some((heat) => heat.Index === heatIndex)) {
				setSelectedHeat(heatIndex);
			}
		},
		[heats],
	);

	return {
		state: {
			selectedRound,
			selectedHeat,
			currentRound,
			currentHeat,
			heats,
			rounds,
		},
		actions: {
			handleRoundChange,
			handleHeatChange,
		},
		meta: {
			showHeatNumbers,
			availableRounds,
			availableHeats,
		},
	};
}
