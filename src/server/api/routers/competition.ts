import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type CompetitionProperties, type Competition } from "~/types/comp";

export const competitionsRouter = createTRPCRouter({
  getAthletes: publicProcedure
    .input(z.object({ compId: z.string() }))
    .query(async ({ input }): Promise<Competition> => {
      const res = await fetch(
        `https://cached-public-api.tuloslista.com/live/v1/results/${input.compId}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
      }
      return res.json() as Promise<Competition>;
    }),
  getCompetitionDetails: publicProcedure
    .input(z.object({ competitionDetailsId: z.string() }))
    .query(async ({ input }): Promise<CompetitionProperties> => {
      const res = await fetch(
        `https://cached-public-api.tuloslista.com/live/v1/competition/${input.competitionDetailsId}/properties`,
      );
      if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
      }
      return res.json() as Promise<CompetitionProperties>;
    }),

  getAll: publicProcedure.query(() => {
    return { get: "get all deez nutz" };
  }),
});
