import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  type CompetitionProperties,
  type Competition,
  type Events,
} from "~/types/comp";
import { type Competitions } from "~/types/events";

// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

export const competitionsRouter = createTRPCRouter({
  getAthletes: publicProcedure
    .input(z.object({ compId: z.string() }))
    .query(async ({ input }): Promise<Competition> => {
      const res = await fetch(`${env.API_URL}/results/${input.compId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
      }
      return res.json() as Promise<Competition>;
    }),
  getAthleteCount: publicProcedure
    .input(z.object({ compId: z.string() }))
    .query(async ({ input }): Promise<number> => {
      const res = await fetch(`${env.API_URL}/results/${input.compId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        console.assert(
          res.status === 404,
          `Unexpected status code: ${res.status}`,
        );
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
      }
      const data = res.json() as Promise<Competition>;
      return (await data).Enrollments.length;
    }),
  getAthleteCounts: publicProcedure
    .input(
      z.object({
        competitionId: z.string(),
        eventIds: z.array(z.string()),
      }),
    )
    .query(async ({ input }): Promise<{ eventId: string; count: number }[]> => {
      // Create an array to store our results
      const results: { eventId: string; count: number }[] = [];

      // Process each event ID
      for (const eventId of input.eventIds) {
        console.log(`${env.API_URL}/results/${input.competitionId}/${eventId}`);
        const fetchResult = await tryCatch(
          fetch(`${env.API_URL}/results/${input.competitionId}/${eventId}`, {
            cache: "no-store",
          }),
        );

        if (fetchResult.error || !fetchResult.data) {
          console.error(`Error fetching data for event ${eventId}`);
          results.push({ eventId, count: 0 });
          continue;
        }

        const response = fetchResult.data;
        if (!response.ok) {
          console.error(
            `Error status for event ${eventId}: ${response.status}`,
          );
          results.push({ eventId, count: 0 });
          continue;
        }

        const parseResult = await tryCatch(
          response.json() as Promise<Competition>,
        );

        if (parseResult.error || !parseResult.data) {
          console.error(`Error parsing data for event ${eventId}`);
          results.push({ eventId, count: 0 });
          continue;
        }
        console.log(parseResult.data.Enrollments.length);
        results.push({
          eventId,
          count: parseResult.data.Enrollments.length,
        });
      }

      return results;
    }),
  getCompetitionDetails: publicProcedure
    .input(z.object({ competitionDetailsId: z.string() }))
    .query(async ({ input }): Promise<CompetitionProperties> => {
      const res = await fetch(
        `${env.API_URL}/competition/${input.competitionDetailsId}/properties`,
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
        `${env.API_URL}/competition/${input.competitionId}`,
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
    const res = await fetch(`${env.API_URL}/competition`, {
      cache: "no-store",
    });
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error("Failed to fetch data");
    }
    return res.json() as Promise<Competitions>;
  }),
});
