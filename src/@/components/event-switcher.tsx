"use client";

import { Calendar, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "~/@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/@/components/ui/select";
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

const roundMapping = {
	Qualify: "Alkuerät",
	Final: "Loppukilpailu",
} as const;
type RoundKey = keyof typeof roundMapping;
type RoundValue = (typeof roundMapping)[RoundKey];

const statusVariants: Record<
	EventList["Status"],
	"unallocated" | "allocated" | "progress" | "official" | "default"
> = {
	Unallocated: "unallocated",
	Allocated: "allocated",
	Progress: "progress",
	Official: "official",
};

const eventStatusLabel: Record<EventList["Status"], string> = {
	Unallocated: "Eräjaot puuttuvat",
	Allocated: "Eräjaot tehty",
	Progress: "Käynnissä",
	Official: "Tulokset valmiit",
};

const eventNameToRoundCase = (name: string): RoundKey | undefined =>
	Object.entries(roundMapping).find(([, v]) => v === name)?.[0] as
		| RoundKey
		| undefined;

const roundParamToEventName = (round: string | null): RoundValue | null =>
	round && round in roundMapping ? roundMapping[round as RoundKey] : null;

function hasMultipleRoundsForEvent(
	events: EventWithDate[],
	eventName: string,
): boolean {
	const rounds = new Set<string>();
	for (const event of events) {
		if (event.EventName === eventName) {
			const round = eventNameToRoundCase(event.Name);
			if (round) {
				rounds.add(round);
				if (rounds.size > 1) return true; // Early exit
			}
		}
	}
	return false;
}

function formatTime(date: string): string {
	return new Intl.DateTimeFormat("fi-FI", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(date));
}

function EventDisplay({ event }: { event: EventWithDate }) {
	const time = formatTime(event.BeginDateTimeWithTZ);
	return (
		<div className="flex w-full items-center justify-between gap-2">
			<div className="flex flex-col gap-2">
				<span>
					{event.EventName} {event.Name}
				</span>
				<Badge variant={statusVariants[event.Status] ?? "default"}>
					{eventStatusLabel[event.Status]}
				</Badge>
			</div>

			<div className="flex min-w-[90px] flex-col items-end gap-2 text-muted-foreground text-xs">
				<span className="flex items-center gap-1">
					{time}
					<Clock className="size-3" />
				</span>
				<span className="flex items-center gap-1">
					{event.date}
					<Calendar className="size-3" />
				</span>
			</div>
		</div>
	);
}

export function EventSwitcher({
	competitionId,
	events,
	currentEventId,
}: {
	competitionId: string;
	events: EventWithDate[];
	currentEventId: string;
}) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const flattenedEvents = events;
	const roundParam = searchParams.get("round");
	const roundName = roundParamToEventName(roundParam);
	const currentEvent = flattenedEvents.find(
		(e) =>
			e.EventId === Number(currentEventId) &&
			(!roundName || e.Name === roundName),
	);
	function handleEventSelection(value: EventWithDate | null) {
		if (!value) return;
		const params = new URLSearchParams(searchParams.toString());
		const roundCase = eventNameToRoundCase(value.Name);
		const hasMultipleRounds = hasMultipleRoundsForEvent(
			flattenedEvents,
			value.EventName,
		);

		if (hasMultipleRounds && roundCase) {
			params.set("round", roundCase);
		} else {
			params.delete("round");
		}
		router.push(
			`/competition/${competitionId}-${value.EventId}?${params.toString()}`,
		);
	}

	return (
		<Select
			onValueChange={handleEventSelection}
			value={currentEvent?.EventId ? currentEvent : undefined}
		>
			<SelectTrigger className="!h-auto !items-center !py-2 !px-4 w-full sm:w-[400px]">
				<SelectValue className="w-full">
					{(event: EventWithDate) => <EventDisplay event={event} />}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{flattenedEvents.map((event) => (
					<SelectItem
						key={`${event.BeginDateTimeWithTZ}-${event.EventId}-${event.Name}`}
						value={event}
					>
						<EventDisplay event={event} />
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
