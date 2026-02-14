"use client";

import { useRound } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
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
	const { state, actions } = useRound();

	if (state.rounds.length <= 1) {
		return null;
	}

	return (
		<div className="flex gap-2">
			{state.rounds.map((round) => (
				<Button
					key={round.Index}
					onClick={() => actions.handleRoundChange(round.Index)}
					variant={state.selectedRound === round.Index ? "default" : "outline"}
				>
					{roundLabel(round)}
				</Button>
			))}
		</div>
	);
}
