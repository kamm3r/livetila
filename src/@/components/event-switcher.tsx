"use client";
import { Calendar, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "~/@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/@/components/ui/select";
import { cn } from "~/@/lib/utils";
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

	const eventStatusLabel: Record<EventList["Status"], string> = {
		Unallocated: "Eräjaot puuttuvat",
		Allocated: "Eräjaot tehty",
		Progress: "Käynnissä",
		Official: "Tulokset valmiit",
	};

	if (!currentEventName) return null;

	return (
		<Select
			itemToStringValue={(event) => String(event.EventId)}
			onValueChange={(event) => {
				router.push(`/competition/${competitionId}-${event.EventId}`);
			}}
			value={flattenedEvents.find((e) => e.EventId === Number(currentEventId))}
		>
			<SelectTrigger className="!h-auto !items-center !py-2 !px-4 w-[400px]">
				<SelectValue className="w-full">
					{(event: EventWithDate) => {
						const time = new Intl.DateTimeFormat("en-GB", {
							hour: "2-digit",
							minute: "2-digit",
						}).format(new Date(event.BeginDateTimeWithTZ));
						return (
							<div className="flex w-full items-center justify-between gap-2">
								<div className="flex flex-col gap-2">
									<span>{event.EventName}</span>
									<Badge
										variant={
											event.Status === "Unallocated"
												? "default"
												: event.Status === "Allocated"
													? "secondary"
													: event.Status === "Progress"
														? "outline"
														: event.Status === "Official"
															? "destructive"
															: "link"
										}
									>
										{eventStatusLabel[event.Status]}
									</Badge>
								</div>

								<div className="flex min-w-[90px] flex-col items-end gap-2 text-muted-foreground text-xs">
									<span className="flex items-center gap-1">
										{time}
										<Clock className="h-3 w-3" />
									</span>
									<span className="flex items-center gap-1">
										{event.date}
										<Calendar className="h-3 w-3" />
									</span>
								</div>
							</div>
						);
					}}
				</SelectValue>
			</SelectTrigger>

			<SelectContent>
				{flattenedEvents.map((event) => {
					const time = new Intl.DateTimeFormat("en-GB", {
						hour: "2-digit",
						minute: "2-digit",
					}).format(new Date(event.BeginDateTimeWithTZ));
					return (
						<SelectItem
							key={`${event.BeginDateTimeWithTZ}-${event.EventId}-${event.EventName}`}
							value={event}
						>
							<div className="flex w-full items-center justify-between gap-2">
								<div className="flex flex-col gap-2">
									<span>{event.EventName}</span>
									<Badge
										variant={
											event.Status === "Unallocated"
												? "outline"
												: event.Status === "Allocated"
													? "secondary"
													: event.Status === "Progress"
														? "default"
														: event.Status === "Official"
															? "destructive"
															: "link"
										}
										className={cn(
											event.Status === "Unallocated"
												? "!bg-gray-500/10 text-gray-500"
												: event.Status === "Allocated"
													? "bg-green-500/10 text-green-500"
													: event.Status === "Progress"
														? "bg-yellow-500/10 text-yellow-500"
														: event.Status === "Official"
															? "!bg-blue-500/10 text-blue-500"
															: "link",
										)}
									>
										{eventStatusLabel[event.Status]}
									</Badge>
								</div>

								<div className="flex min-w-[90px] flex-col items-end gap-2 text-muted-foreground text-xs">
									<span className="flex items-center gap-1">
										{time}
										<Clock className="h-3 w-3" />
									</span>
									<span className="flex items-center gap-1">
										{event.date}
										<Calendar className="h-3 w-3" />
									</span>
								</div>
							</div>
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}
