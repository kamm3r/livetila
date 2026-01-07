"use client";
import { useRouter } from "next/navigation";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/@/components/ui/select";
import type { Events, EventList } from "~/types/comp";

interface EventWithDate extends EventList {
	date: string;
}

export function EventSwitcher({
	competitionId,
	events,
	currentEventId,
}: {
	competitionId: string;
	events: Events;
	currentEventId: string;
}) {
	const router = useRouter();
	const flattenedEvents: EventWithDate[] = Object.entries(events).flatMap(
		([date, eventList]) =>
			eventList.map((event) => ({
				...event,
				date,
			})),
	);

	const currentEventName = flattenedEvents.find(
		(e) => e.EventId === Number(currentEventId),
	)?.EventName;

	if (!currentEventName) return null;

	return (
		<Select
			onValueChange={(eventName) => {
				const selectedEvent = flattenedEvents.find(
					(e) => e.EventName === eventName,
				);

				if (!selectedEvent) return;

				router.push(`/competition/${competitionId}-${selectedEvent.EventId}`);
			}}
			value={currentEventName}
		>
			<SelectTrigger className="w-[300px]">
				<SelectValue title="Select event" />
			</SelectTrigger>

			<SelectContent>
				{flattenedEvents.map((event) => (
					<SelectItem key={event.Id} value={event.EventName}>
						<div className="flex justify-between gap-2">
							<span>{event.EventName}</span>
							{event.Status === "FINISHED" && (
								<span className="text-muted-foreground text-xs">Finished</span>
							)}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
