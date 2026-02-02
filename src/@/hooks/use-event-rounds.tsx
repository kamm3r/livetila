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
  if (!param) return null;

  return rounds.find((r) => {
    if (param === "Final") return r.RoundTypeCategory === "Final";
    if (param === "Qualify") return r.RoundTypeCategory === "Qualify";
    return false;
  })?.Index;
}

function roundIndexToParam(round: Round) {
  return round.RoundTypeCategory;
}

export function useEventRounds(rounds: Round[]): EventRoundsState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const roundFromUrl = roundParamToIndex(rounds, searchParams.get("round"));
  const initialRoundIndex = useMemo(() => {
    if (rounds.length === 0) {
      return 0;
    }
    return rounds[rounds.length - 1]?.Index ?? 0;
  }, [rounds]);

  const [selectedRound, setSelectedRound] = useState<number>(initialRoundIndex);
  const [selectedHeat, setSelectedHeat] = useState<number>(1);

  useEffect(() => {
    if (roundFromUrl != null && roundFromUrl !== selectedRound) {
      setSelectedRound(roundFromUrl);
      setSelectedHeat(
        rounds.find((r) => r.Index === roundFromUrl)?.Heats?.[0]?.Index ?? 1,
      );
    }
  }, [roundFromUrl, rounds, selectedRound]);

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

      const param = roundIndexToParam(round);
      const params = new URLSearchParams(searchParams.toString());

      if (param) {
        params.set("round", param);
      } else {
        params.delete("round");
      }

      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });

      setSelectedRound(roundIndex);
      setSelectedHeat(round?.Heats?.[0]?.Index ?? 1);
    },
    [rounds, pathname, router, searchParams],
  );

  const handleHeatChange = useCallback(
    (heatIndex: number) => {
      if (!heats.some((heat) => heat.Index === heatIndex)) return;
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
    rounds,
    showHeatNumbers,
    availableRounds,
    availableHeats,
    handleRoundChange,
    handleHeatChange,
  };
}
