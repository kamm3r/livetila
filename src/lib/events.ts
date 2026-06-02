import type { EventList, Events } from "~/types/comp";

export interface EventWithDate extends EventList {
	date: string;
}

export function flattenEvents(events: Events): EventWithDate[] {
	return Object.entries(events).flatMap(([date, eventList]) =>
		eventList.map((event) => ({
			...event,
			date,
		})),
	);
}
