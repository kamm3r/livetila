import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { type CompetitionList } from "~/types/comp";

export const toolsRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        page: z.number().default(0),
        pageSize: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      const res = await fetch("https://tuloslista.com/Login/Index");
      const html = await res.text();

      const match = /\$scope\.competitionList\s*=\s*(\[.*?\]);/s.exec(html);
      if (!match) throw new Error("Could not find competition list");

      const allCompetitions = JSON.parse(match[1]!) as CompetitionList[];

      // Paginate
      const start = input.page * input.pageSize;
      const end = start + input.pageSize;
      const competitions = allCompetitions.slice(start, end);

      return {
        competitions,
        hasMore: end < allCompetitions.length,
        total: allCompetitions.length,
      };
    }),

  login: publicProcedure
    .input(z.object({ id: z.number(), passwd: z.string() }))
    .mutation(async ({ input }) => {
      const res = await fetch("https://tuloslista.com/Login/Index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: input.id,
          passwd: input.passwd,
        }),
      });

      if (!res.ok) return false;
      return true;
    }),

  createEmpty: publicProcedure.mutation(async () => {
    const res = await fetch(
      "https://tuloslista.com/Login/CreateEmptyCompetition",
    );

    if (!res.ok) throw new Error("Failed to create empty competition");

    return true;
  }),
  getCompetition: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // Fetch competition data from your backend
      const res = await fetch(`https://live.tuloslista.com/${input.id}`);
      return res.json();
    }),

  setPassword: publicProcedure
    .input(z.object({ id: z.number(), pass: z.string().min(4) }))
    .mutation(async ({ input }) => {
      const res = await fetch("https://tuloslista.com/Edit/SetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass: input.pass }),
      });
      return res.ok;
    }),

  saveData: publicProcedure
    .input(z.object({ competition: z.any() }))
    .mutation(async ({ input }) => {
      const res = await fetch(
        "https://tuloslista.com/Edit/SaveCompetitionData",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ competition: input.competition }),
        },
      );
      return res.ok;
    }),
});
