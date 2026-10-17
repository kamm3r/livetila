import type { CompetitionProperties } from "~/types/comp";

const PORTAL_URL = "https://www.tuloslista.com/varmistus/";
const CONFIRMATION_SETTING = 1;

export type OnlineConfirmation = {
  url: string;
  // Absent when the event has no valid start time.
  deadline: Date | null;
};

// Online confirmation (verkkovarmistus) for one event, or null when the
// competition does not use it. The portal only restores a competition from its
// hash after a previous visit; others land on its open-competition list.
export function onlineConfirmation(
  properties: CompetitionProperties | null | undefined,
  eventBegin: string | undefined,
): OnlineConfirmation | null {
  const setting = properties?.Settings?.find(
    (entry) => entry.Type === CONFIRMATION_SETTING,
  );
  const competitionId = properties?.Competition?.Id;
  if (setting?.StringValue !== "on" || !competitionId) return null;

  const begin = new Date(eventBegin ?? "").getTime();
  const minutes =
    setting.IntValue || properties!.Competition.ConfirmationDeadlineInMinutes;
  return {
    url: `${PORTAL_URL}#!/${competitionId}`,
    deadline: Number.isNaN(begin) ? null : new Date(begin - minutes * 60_000),
  };
}
