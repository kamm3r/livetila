import type { CompetitionDetails, CompetitionProperties } from "~/types/comp";

const PORTAL_URL = "https://www.tuloslista.com/varmistus/";
const CONFIRMATION_SETTING = 1;

export type OnlineConfirmation = {
  url: string;
  deadline: Date;
};

// Whether the competition has online confirmation (verkkovarmistus) switched
// on. Only these need the portal's own competition data.
export function usesOnlineConfirmation(
  properties: CompetitionProperties | null | undefined,
): boolean {
  return (
    properties?.Settings?.find((entry) => entry.Type === CONFIRMATION_SETTING)
      ?.StringValue === "on"
  );
}

// Online confirmation for one event while the portal accepts it, otherwise
// null. Mirrors the portal: it opens at the start of the day `window` days
// before the event day, in local time, and closes `deadline` minutes before
// the event starts. The portal only restores a competition from its hash after
// a previous visit; others land on its open-competition list.
export function onlineConfirmation(
  portal: CompetitionDetails | null | undefined,
  eventBegin: string | undefined,
  now: number,
): OnlineConfirmation | null {
  const begin = new Date(eventBegin ?? "");
  if (!portal || Number.isNaN(begin.getTime())) return null;

  const opens = new Date(
    begin.getFullYear(),
    begin.getMonth(),
    begin.getDate() - portal.ConfirmationOpensWindowInDays,
  );
  const deadline = new Date(
    begin.getTime() - portal.ConfirmationDeadlineInMinutes * 60_000,
  );
  if (now < opens.getTime() || now >= deadline.getTime()) return null;
  return { url: `${PORTAL_URL}#!/${portal.Id}`, deadline };
}
