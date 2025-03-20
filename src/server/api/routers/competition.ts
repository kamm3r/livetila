import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type CompetitionProperties, type Competition, type Events } from "~/types/comp";
import {type Competitions } from "~/types/events";

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

  getEvents: publicProcedure
  .input(z.object({ competitionId: z.string() }))
  .query(async ({ input }): Promise<Events> => {
    const res = await fetch(
      `https://cached-public-api.tuloslista.com/live/v1/competition/${input.competitionId}`
    );
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error("Failed to fetch data");
    }
    return res.json() as Promise<Events>;
  }),
  getAll: publicProcedure.query(() => {
    return { get: "get all deez nutz" };
  }),
  getCompetitions: publicProcedure.query(async (): Promise<Competitions> => {
    const res = await fetch(`https://cached-public-api.tuloslista.com/live/v1/competition`, { cache: "no-store" });
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error("Failed to fetch data");
    }
    return res.json() as Promise<Competitions>;
  })
});
