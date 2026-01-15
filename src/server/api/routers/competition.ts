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

const lastHashes = new Map<string, string>();

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
			return (await data.json()) as Promise<Competition>;
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
		.input(z.object({ compId: z.number() }))
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

			console.log("[SERVER] Subscription started:", key);

			// ✅ Create a stream that polls the API
			const stream = new ReadableStream({
				async start(controller) {
					const pollInterval = setInterval(async () => {
						// Check if aborted
						if (signal?.aborted) {
							clearInterval(pollInterval);
							controller.close();
							return;
						}

						try {
							const res = await fetch(`${API_URL}/results/${key}`, {
								cache: "no-store",
							});

							if (!res.ok) return;

							const data = await res.json();
							const currentHash = data?.Diag?.TS || "";
							const lastHash = lastHashes.get(key);

							if (currentHash && currentHash !== lastHash) {
								lastHashes.set(key, currentHash);
								console.log("[SERVER] New data detected:", key);
								controller.enqueue(data);
							}
						} catch (err) {
							console.error("[SERVER] Poll error:", err);
						}
					}, 2000);

					// Cleanup on abort
					signal?.addEventListener("abort", () => {
						clearInterval(pollInterval);
						controller.close();
						lastHashes.delete(key);
						console.log("[SERVER] Stream closed:", key);
					});
				},
			});

			// ✅ Consume the stream and yield data
			const reader = stream.getReader();

			try {
				while (true) {
					const { done, value } = await reader.read();

					if (done) break;

					yield value;
				}
			} finally {
				reader.releaseLock();
			}
		}),
	getAll: publicProcedure.query(() => {
		return { get: "get all deez nutz" };
	}),
});
