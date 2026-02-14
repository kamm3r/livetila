import { TRPCError } from "@trpc/server";
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
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch athlete data",
				});
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
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch competition details",
				});
			}
			return (await data.json()) as CompetitionProperties;
		}),
	getCompetitions: publicProcedure.query(
		async (): Promise<CompetitionList[]> => {
			const { data, error } = await tryCatch(fetch(`${API_URL}/competition`));

			if (error || !data) {
				console.error("Error fetching comp data:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch competitions",
				});
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
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch events",
				});
			}
			return (await data.json()) as Events;
		}),
});
