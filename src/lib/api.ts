import type {
  Competition,
  CompetitionList,
  CompetitionProperties,
  Events,
} from "~/types/comp";

const API_URL = "https://cached-public-api.tuloslista.com/live/v1";

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { cache: "no-store", signal });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getCompetitions(signal?: AbortSignal): Promise<CompetitionList[]> {
    return fetchJson<CompetitionList[]>(`${API_URL}/competition`, signal);
  },

  getEvents(compId: string, signal?: AbortSignal): Promise<Events> {
    return fetchJson<Events>(`${API_URL}/competition/${compId}`, signal);
  },

  getAthletes(compId: string, signal?: AbortSignal): Promise<Competition> {
    return fetchJson<Competition>(`${API_URL}/results/${compId}`, signal);
  },

  getCompetitionDetails(
    competitionDetailsId: string,
    signal?: AbortSignal,
  ): Promise<CompetitionProperties> {
    return fetchJson<CompetitionProperties>(
      `${API_URL}/competition/${competitionDetailsId}/properties`,
      signal,
    );
  },
};
