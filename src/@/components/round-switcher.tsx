"use client";

import { Tabs, TabsList, TabsTrigger } from "~/@/components/ui/tabs";
import { useRound } from "~/@/components/round-provider";
import type { Round } from "~/types/comp";

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
	const {
		rounds,
		selectedRound,
		handleRoundChange,
	} = useRound();

	if (rounds.length <= 1) {
		return null;
	}

	return (
		<Tabs
			value={String(selectedRound)}
			onValueChange={(value) => handleRoundChange(Number(value))}
			className="w-full"
		>
			<TabsList className="grid w-full grid-cols-2">
				{rounds.map((round) => (
					<TabsTrigger
						key={round.Index}
						value={String(round.Index)}
						className="data-active:bg-primary/30 data-active:text-primary"
					>
						{roundLabel(round)}
					</TabsTrigger>
				))}
			</TabsList>
		</Tabs>
	);
}