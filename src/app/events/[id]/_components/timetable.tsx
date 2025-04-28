"use client";

import { Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "~/@/components/ui/card";
import { StatusIndicator } from "~/@/components/ui/status-indicator";
import { cn } from "~/@/lib/utils";
import { formatTime } from "~/@/utils/event-utils";
import { type EventList } from "~/types/comp";

type AthleteCounts = {
  athleteCountData: AthleteCount[];
  isLoading: boolean;
  isError: boolean;
};

type AthleteCount = {
  date: string;
  event: string;
  athleteCount: number | undefined;
};

export function Timetable({
  data,
  athleteCounts,
  selectedEvent,
  setSelectedEvent,
}: {
  data: EventList[];
  athleteCounts: AthleteCounts;
  selectedEvent: EventList | null;
  setSelectedEvent: React.Dispatch<React.SetStateAction<EventList | null>>;
}) {
  return (
    <div className="grid max-h-[36rem] gap-4 overflow-hidden overflow-y-scroll">
      {data.map((event, index) => (
        <Card
          key={event.Id}
          className={cn(
            "hover:bgc-muted/60 dark:hover:bg-muted/10 transition-color",
            selectedEvent === event && "bg-blue-50 dark:bg-blue-900/20",
          )}
          onClick={() => setSelectedEvent(event)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {event.EventName || event.Name}
                  </h3>
                </div>
                <div className="text-muted-foreground mt-1 text-sm">
                  {event.Name}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="text-muted-foreground h-4 w-4" />
                    <span>{formatTime(event.BeginDateTimeWithTZ)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span>{event.GroupName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <span>
                      {athleteCounts.isLoading
                        ? "loading"
                        : athleteCounts.athleteCountData[index]
                            ?.athleteCount}{" "}
                      athletes
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusIndicator
                  // @ts-expect-error TODO: Fix this
                  status={event.Status}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
