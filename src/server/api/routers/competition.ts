import { TRPCError } from "@trpc/server";
import { cache } from "react";
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

// Cached fetch functions for request deduplication
const cachedFetchAthletes = cache(async (compId: string) => {
	const { data, error } = await tryCatch(
		fetch(`${API_URL}/results/${compId}`, {
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

	if (!data.ok) {
		console.error("API returned error status:", data.status);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to fetch athlete data",
		});
	}

	return data.json() as Promise<Competition>;
});

const cachedFetchCompetitionDetails = cache(async (competitionDetailsId: string) => {
	const { data, error } = await tryCatch(
		fetch(`${API_URL}/competition/${competitionDetailsId}/properties`),
	);
	if (error || !data) {
		console.error("Error fetching comp data:", error);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to fetch competition details",
		});
	}

	if (!data.ok) {
		console.error("API returned error status:", data.status);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to fetch competition details",
		});
	}

	return data.json() as Promise<CompetitionProperties>;
});

const cachedFetchCompetitions = cache(async () => {
	const { data, error } = await tryCatch(fetch(`${API_URL}/competition`));

	if (error || !data) {
		console.error("Error fetching comp data:", error);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to fetch competitions",
		});
	}

	if (!data.ok) {
		console.error("API returned error status:", data.status);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to fetch competitions",
		});
	}

	return data.json() as Promise<CompetitionList[]>;
});

const cachedFetchEvents = cache(async (compId: string) => {
	const { data, error } = await tryCatch(
		fetch(`${API_URL}/competition/${compId}`),
	);
	if (error || !data) {
		console.error("Error fetching comp data:", error);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to fetch events",
		});
	}

	if (!data.ok) {
		console.error("API returned error status:", data.status);
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Failed to fetch events",
		});
	}

	return data.json() as Promise<Events>;
});

export const competitionsRouter = createTRPCRouter({
	getAthletes: publicProcedure
		.input(z.object({ compId: z.string() }))
		.query(async ({ input }): Promise<Competition> => {
			return cachedFetchAthletes(input.compId);
		}),
	getCompetitionDetails: publicProcedure
		.input(z.object({ competitionDetailsId: z.string() }))
		.query(async ({ input }): Promise<CompetitionProperties> => {
			return cachedFetchCompetitionDetails(input.competitionDetailsId);
		}),
	getCompetitions: publicProcedure.query(
		async (): Promise<CompetitionList[]> => {
			return cachedFetchCompetitions();
		},
	),
	getEvents: publicProcedure
		.input(z.object({ compId: z.string() }))
		.query(async ({ input }): Promise<Events> => {
			return cachedFetchEvents(input.compId);
		}),
});
