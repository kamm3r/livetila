import type {
  Competition,
  CompetitionDetails,
  CompetitionList,
  CompetitionProperties,
  Events,
} from "~/types/comp";

const API_URL = "https://live.tuloslista.com/api/v1";
// Same-origin proxy to the confirmation portal's API, which sends no CORS
// headers. See vercel.json and vite.config.ts.
const CONFIRMATION_API_URL = "/api/varmistus";

async function fetchJson<T>(
  url: string,
  signal?: AbortSignal,
  cache: RequestCache = "default",
): Promise<T> {
  const response = await fetch(url, { cache, signal });
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

  // Competitions the confirmation portal currently lists, with its deadline
  // and opening window.
  getConfirmationCompetitions(
    signal?: AbortSignal,
  ): Promise<CompetitionDetails[]> {
    return fetchJson<CompetitionDetails[]>(
      `${CONFIRMATION_API_URL}/competition`,
      signal,
      "no-store",
    );
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
