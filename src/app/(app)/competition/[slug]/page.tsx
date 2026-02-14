import { ClipboardList, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ParticipantLayout,
  ProtocolLayout,
  ResultLayout,
  ResultProvider,
} from "~/@/components/competition-layout";
import {
  EventSwitcher,
  type EventWithDate,
} from "~/@/components/event-switcher";
import { RoundProvider } from "~/@/components/round-provider";
import { RoundSwitcher } from "~/@/components/round-switcher";
import { Skeleton } from "~/@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/@/components/ui/tabs";
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
      <div className="flex flex-1 items-end justify-between gap-2 lg:flex-col">
        <ObsPopover slug={`${compId}-${eventId}`} />
        <RoundSwitcher />
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
    <Tabs className="mt-2 w-full" defaultValue="participants">
      <TabsList className="mb-2 grid h-auto w-full grid-cols-3">
        <TabsTrigger
          className="data-active:bg-primary/30 data-active:text-primary dark:data-active:bg-primary/30 dark:data-active:text-primary"
          value="participants"
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="size-4" />
            <span className="hidden sm:block">Ilmoittautuneet</span>
          </div>
        </TabsTrigger>
        <TabsTrigger
          className="data-active:bg-primary/30 data-active:text-primary dark:data-active:bg-primary/30 dark:data-active:text-primary"
          value="protocol"
        >
          <div className="flex items-center justify-center gap-2">
            <ClipboardList className="size-4" />
            <span className="hidden sm:block">Pöytäkirjat</span>
          </div>
        </TabsTrigger>
        <TabsTrigger
          className="data-active:bg-primary/30 data-active:text-primary dark:data-active:bg-primary/30 dark:data-active:text-primary"
          value="results"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="size-4" />
            <span className="hidden sm:block">Tulokset</span>
          </div>
        </TabsTrigger>
      </TabsList>
      <TabsContent
        className="fade-in-50 animate-in duration-300"
        value="participants"
      >
        <ParticipantLayout enrollments={athletes.Enrollments} />
      </TabsContent>
      <TabsContent
        className="fade-in-50 animate-in duration-300"
        value="protocol"
      >
        <ProtocolLayout isTrack={isTrack} />
      </TabsContent>
      <TabsContent
        className="fade-in-50 animate-in space-y-5 duration-300"
        value="results"
      >
        <ResultProvider compId={`${compId}/${eventId}`} isProgress={isProgress}>
          <ResultLayout />
        </ResultProvider>
      </TabsContent>
    </Tabs>
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

  function flattenEvents(events: Events): EventWithDate[] {
    return Object.entries(events).flatMap(([date, eventList]) =>
      eventList.map((event) => ({
        ...event,
        date,
      })),
    );
  }
  const compEvents = flattenEvents(compEventsRaw);

  return (
    <main className="container relative mx-auto flex grow flex-col p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col items-start gap-2">
          <h2 className="scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0">
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
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-8 w-28 self-end" />
              <Skeleton className="h-10 w-full" />
              <div className="mt-2 space-y-3">
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
