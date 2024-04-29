import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type Competition } from "~/types/comp";

export const competitionsRouter = createTRPCRouter({
  getAthletes: publicProcedure
    .input(z.object({ compId: z.string() }))
    .query(async ({ input }): Promise<Competition> => {
      const res = await fetch(
        `https://cached-public-api.tuloslista.com/live/v1/results/${input.compId}`,
      );
      if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
      }
      return res.json();
    }),

  getAll: publicProcedure.query(() => {
    return { get: "get all deez nutz" };
  }),
});
