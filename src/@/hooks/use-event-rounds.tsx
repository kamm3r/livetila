"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Heat, Round } from "~/types/comp";

export interface EventRoundsState {
  selectedRound: number;
  selectedHeat: number;
  currentRound: Round | undefined;
  currentHeat: Heat | undefined;
  heats: Heat[];
  rounds: Round[];
  showHeatNumbers: boolean;
  availableRounds: number[];
  availableHeats: number[];
  handleRoundChange: (roundIndex: number) => void;
  handleHeatChange: (heatIndex: number) => void;
}

function roundParamToIndex(rounds: Round[], param: string | null) {
  if (!param || rounds.length === 0) return null;
  return rounds.find((r) => r.RoundTypeCategory === param)?.Index ?? null;
}

function getDefaultRoundIndex(rounds: Round[]) {
  return rounds.at(-1)?.Index ?? 0;
}

export function useEventRounds(rounds: Round[]): EventRoundsState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roundParam = searchParams.get("round");
  const roundFromUrl = roundParamToIndex(rounds, roundParam);
  const [selectedRound, setSelectedRound] = useState<number>(
    () => roundFromUrl ?? getDefaultRoundIndex(rounds),
  );
  const [selectedHeat, setSelectedHeat] = useState<number>(1);

  useEffect(() => {
    if (roundFromUrl != null && roundFromUrl !== selectedRound) {
      setSelectedRound(roundFromUrl);
      setSelectedHeat(
        rounds.find((r) => r.Index === roundFromUrl)?.Heats?.[0]?.Index ?? 1,
      );
    }
  }, [roundFromUrl, rounds, selectedRound]);

  useEffect(() => {
    if (rounds.length > 0 && selectedRound === 0 && roundFromUrl == null) {
      const defaultIndex = getDefaultRoundIndex(rounds);
      setSelectedRound(defaultIndex);
      setSelectedHeat(
        rounds.find((r) => r.Index === defaultIndex)?.Heats?.[0]?.Index ?? 1,
      );
    }
  }, [rounds, selectedRound, roundFromUrl]);

  const currentRound =
    rounds.find((round) => round.Index === selectedRound) ?? rounds[0];

  const heats = currentRound?.Heats ?? [];

  const currentHeat =
    heats.find((heat) => heat.Index === selectedHeat) ?? heats[0];

  const showHeatNumbers = heats.length >= 2;

  const availableRounds = rounds.map((round) => round.Index);

  const availableHeats = heats.map((heat) => heat.Index);

  function handleRoundChange(roundIndex: number) {
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
    setSelectedHeat(round?.Heats?.[0]?.Index ?? 1);
  }

  function handleHeatChange(heatIndex: number) {
    if (heats.some((heat) => heat.Index === heatIndex)) {
      setSelectedHeat(heatIndex);
    }
  }

  return {
    selectedRound,
    selectedHeat,
    currentRound,
    currentHeat,
    heats,
    rounds,
    showHeatNumbers,
    availableRounds,
    availableHeats,
    handleRoundChange,
    handleHeatChange,
  };
}
