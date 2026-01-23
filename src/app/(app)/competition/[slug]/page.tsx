import { ClipboardList, Trophy, Users } from "lucide-react";
import {
  ParticipantLayout,
  ProtocolLayout,
  ResultLayout,
} from "~/@/components/competition-layout";
import { EventSwitcher } from "~/@/components/event-switcher";
import { ObsPopover } from "~/@/components/obs-popover";
import { RoundProvider } from "~/@/components/round-provider";
import { RoundSwitcher } from "~/@/components/round-switcher";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/@/components/ui/tabs";
import { api } from "~/trpc/server";

export default async function Comp({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const compId = slug?.slice(0, slug.indexOf("-"));
  const eventId = slug?.slice(slug.indexOf("-") + 1);
  const compEvents = await api.competition.getEvents({ compId: compId });
  const selectedEvent = Object.values(compEvents)
    .flat()
    .find((event) => event.EventId === Number(eventId));
  const compDetails = await api.competition.getCompetitionDetails({
    competitionDetailsId: compId,
  });
  const athletes = await api.competition.getAthletes({
    compId: `${compId}/${eventId}`,
  });

  const isTrack = selectedEvent?.Category === "Track";
  return (
    <RoundProvider key={eventId} rounds={athletes.Rounds}>
      <main className="container relative mx-auto flex grow flex-col p-4 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col items-start gap-2">
            <h2 className="scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight first:mt-0">
              {!!compDetails && compDetails.Competition.Name}
            </h2>
            <EventSwitcher
              competitionId={compId}
              currentEventId={eventId}
              events={compEvents}
            />
          </div>
          <RoundSwitcher />
          <ObsPopover slug={slug} />
        </div>
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
            <ParticipantLayout athletes={athletes} />
          </TabsContent>
          <TabsContent
            className="fade-in-50 animate-in duration-300"
            value="protocol"
          >
            <ProtocolLayout isTrack={isTrack ?? false} />
          </TabsContent>
          <TabsContent
            className="fade-in-50 animate-in space-y-5 duration-300"
            value="results"
          >
            <ResultLayout
              compId={`${compId}/${eventId}`}
              isProgress={selectedEvent?.Status === "Progress"}
            />
          </TabsContent>
        </Tabs>
      </main>
    </RoundProvider>
  );
}
