import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TabsWithHaptics from "~/@/components/tabs-haptics";
import {
  ParticipantLayout,
  ProtocolLayout,
  ResultLayout,
  ResultProvider,
} from "~/@/components/competition-layout";
import { EventSwitcher } from "~/@/components/event-switcher";
import { flattenEvents, type EventWithDate } from "~/@/lib/events";
import { RoundProvider } from "~/@/components/round-provider";
import { RoundSwitcher } from "~/@/components/round-switcher";
import { Skeleton } from "~/@/components/ui/skeleton";

import { api } from "~/trpc/server";
import type { Competition, Events } from "~/types/comp";

const ObsPopover = dynamic(() =>
  import("~/@/components/obs-popover").then((mod) => mod.ObsPopover),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [compId] = slug.split("-", 2);
  if (!compId) return { title: "Kilpailu - Livetila" };

  try {
    const compDetails = await api.competition.getCompetitionDetails({
      competitionDetailsId: compId,
    });
    return {
      title: `${compDetails.Competition.Name} - Livetila`,
      description: `Seuraa kilpailun ${compDetails.Competition.Name} tuloksia reaaliajassa`,
    };
  } catch {
    return { title: "Kilpailu - Livetila" };
  }
}

/**
 * Async component that fetches athlete data and renders the tab contents.
 * Wrapped in its own Suspense boundary so the page shell streams first.
 */
async function CompetitionContent({
  compId,
  eventId,
  compEvents,
}: {
  compId: string;
  eventId: string;
  compEvents: EventWithDate[];
}) {
  const athletes = await api.competition.getAthletes({
    compId: `${compId}/${eventId}`,
  });

  const selectedEvent = compEvents.find(
    (event) => event.EventId === Number(eventId),
  );

  const isTrack = selectedEvent?.Category === "Track";

  return (
    <RoundProvider key={eventId} rounds={athletes.Rounds}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <RoundSwitcher />
        <ObsPopover slug={`${compId}-${eventId}`} />
      </div>
      <CompetitionTabs
        athletes={athletes}
        compId={compId}
        eventId={eventId}
        isProgress={selectedEvent?.Status === "Progress"}
        isTrack={isTrack ?? false}
      />
    </RoundProvider>
  );
}

function CompetitionTabs({
  athletes,
  compId,
  eventId,
  isTrack,
  isProgress,
}: {
  athletes: Competition;
  compId: string;
  eventId: string;
  isTrack: boolean;
  isProgress: boolean;
}) {
  return (
    <TabsWithHaptics
      className="mt-2 w-full"
      defaultValue="participants"
      tabs={[
        {
          value: "participants",
          label: "Ilmoittautuneet",
          icon: "users",
          content: (
            <ParticipantLayout enrollments={athletes.Enrollments} />
          ),
        },
        {
          value: "protocol",
          label: "Pöytäkirjat",
          icon: "clipboard-list",
          content: <ProtocolLayout isTrack={isTrack} />,
        },
        {
          value: "results",
          label: "Tulokset",
          icon: "trophy",
          content: (
            <ResultProvider compId={`${compId}/${eventId}`} isProgress={isProgress}>
              <ResultLayout />
            </ResultProvider>
          ),
        },
      ]}
    />
  );
}

export default async function Comp({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [compId, eventId] = slug.split("-", 2);
  if (!compId || !eventId) {
    notFound();
  }

  const [compEventsRaw, compDetails] = await Promise.all([
    api.competition.getEvents({ compId }),
    api.competition.getCompetitionDetails({ competitionDetailsId: compId }),
  ]);

  const compEvents = flattenEvents(compEventsRaw);

  return (
    <main className="container relative mx-auto flex grow flex-col px-4 py-4 sm:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start gap-3">
          <h2 className="scroll-m-20 border-b pb-2 font-semibold text-2xl tracking-tight first:mt-0 sm:text-3xl">
            {compDetails ? compDetails.Competition.Name : null}
          </h2>
          <EventSwitcher
            competitionId={compId}
            currentEventId={eventId}
            events={compEvents}
          />
        </div>
        <Suspense
          fallback={
            <div className="flex w-full flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-10 w-48" />
              </div>
              <div className="mt-2 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            </div>
          }
        >
          <CompetitionContent
            compEvents={compEvents}
            compId={compId}
            eventId={eventId}
          />
        </Suspense>
      </div>
    </main>
  );
}
