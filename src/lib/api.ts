import type {
  Competition,
  CompetitionList,
  CompetitionProperties,
  Events,
} from "~/types/comp";

const API_URL = "https://cached-public-api.tuloslista.com/live/v1";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getCompetitions(): Promise<CompetitionList[]> {
    return fetchJson<CompetitionList[]>(`${API_URL}/competition`);
  },

  getEvents(compId: string): Promise<Events> {
    return fetchJson<Events>(`${API_URL}/competition/${compId}`);
  },

  getAthletes(compId: string): Promise<Competition> {
    return fetchJson<Competition>(`${API_URL}/results/${compId}`);
  },

  getCompetitionDetails(
    competitionDetailsId: string,
  ): Promise<CompetitionProperties> {
    return fetchJson<CompetitionProperties>(
      `${API_URL}/competition/${competitionDetailsId}/properties`,
    );
  },
};
