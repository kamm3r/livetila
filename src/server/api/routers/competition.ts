import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { tryCatch } from "~/shared/try-catch";
import type {
  Competition,
  CompetitionList,
  CompetitionProperties,
  Events,
} from "~/types/comp";

const API_URL = "https://cached-public-api.tuloslista.com/live/v1";
const pollIntervals = new Map<string, ReturnType<typeof setInterval>>();

export const competitionsRouter = createTRPCRouter({
  getAthletes: publicProcedure
    .input(z.object({ compId: z.string() }))
    .query(async ({ input }): Promise<Competition> => {
      const { data, error } = await tryCatch(
        fetch(`${API_URL}/results/${input.compId}`, {
          cache: "no-store",
        }),
      );

      if (error || !data) {
        console.error("Error fetching comp data:", error);
        return {} as Competition;
      }
      return (await data.json()) as Competition;
    }),
  getCompetitionDetails: publicProcedure
    .input(z.object({ competitionDetailsId: z.string() }))
    .query(async ({ input }): Promise<CompetitionProperties> => {
      const { data, error } = await tryCatch(
        fetch(
          `${API_URL}/competition/${input.competitionDetailsId}/properties`,
        ),
      );
      if (error || !data) {
        console.error("Error fetching comp data:", error);
        return {} as CompetitionProperties;
      }
      return (await data.json()) as CompetitionProperties;
    }),
  getCompetitions: publicProcedure.query(
    async (): Promise<CompetitionList[]> => {
      const { data, error } = await tryCatch(fetch(`${API_URL}/competition`));

      if (error || !data) {
        console.error("Error fetching comp data:", error);
        return [];
      }
      return (await data.json()) as CompetitionList[];
    },
  ),
  getEvents: publicProcedure
    .input(z.object({ compId: z.string() }))
    .query(async ({ input }): Promise<Events> => {
      const { data, error } = await tryCatch(
        fetch(`${API_URL}/competition/${input.compId}`),
      );
      if (error || !data) {
        console.error("Error fetching comp data:", error);
        return {} as Events;
      }
      return (await data.json()) as Events;
    }),
  onResultsUpdate: publicProcedure
    .input(
      z.object({
        compId: z.string(),
        eventId: z.string(),
      }),
    )
    .subscription(async function* ({ input, signal }) {
      const key = `${input.compId}/${input.eventId}`;
      let lastHash = "";

      console.log("[SERVER] Subscription started:", key);

      const stream = new ReadableStream({
        async start(controller) {
          let pollInterval: ReturnType<typeof setInterval> | undefined;
          const cleanup = () => {
            if (pollInterval) {
              clearInterval(pollInterval);
              pollIntervals.delete(key);
            }
          };

          pollInterval = setInterval(async () => {
            if (!signal) {
              cleanup();
              controller.close();
              return;
            }

            if (signal.aborted) {
              cleanup();
              controller.close();
              return;
            }

            const { data: res, error } = await tryCatch(
              fetch(`${API_URL}/results/${key}`, {
                cache: "no-store",
              }),
            );
            if (!res || error) {
              console.error("[SERVER] Poll error:", error);
              return;
            }
            if (!res?.ok) {
              console.warn("[SERVER] Non-OK response:", res?.status);
              return;
            }

            const data = await res.json();
            const currentHash = data?.Diag?.TS || "";

            if (currentHash && currentHash !== lastHash) {
              lastHash = currentHash;
              console.log("[SERVER] New data detected:", key);
              controller.enqueue(data);
            }
          }, 2000);

          pollIntervals.set(key, pollInterval);

          signal?.addEventListener("abort", () => {
            cleanup();
            console.log("[SERVER] Stream closed:", key);
          });
        },
      });

      const reader = stream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield value;
        }
      } finally {
        if (pollIntervals.has(key)) {
          clearInterval(pollIntervals.get(key));
          pollIntervals.delete(key);
        }
        reader.releaseLock();
      }
    }),
});
