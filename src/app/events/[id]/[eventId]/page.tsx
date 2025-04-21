import { api } from "~/trpc/server";
import EventDetailTabs from "~/app/events/[id]/[eventId]/_components/event";
import { CompetitionHeader } from "~/@/components/competition-header";
import { RoundProvider } from "~/@/components/round-provider";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string; eventId: string }>;
}) {
  const { id, eventId } = await params;
  const compId = `${id}/${eventId}`;
  console.log(compId);
  console.log(id);
  const eventData = await api.competition.getAthletes({ compId });
  const compData = await api.competition.getCompetitionDetails({
    competitionDetailsId: id,
  });

  // Get the latest round for initial display
  const latestRound =
    eventData.Rounds.length > 0
      ? eventData.Rounds[eventData.Rounds.length - 1]
      : null;

  return (
    <>
      <RoundProvider rounds={eventData.Rounds}>
        {/* Header */}
        <CompetitionHeader
          dataEvent={eventData}
          id={id}
          dataComp={compData}
          latestRound={latestRound!}
        />
        {/* Round selection and tabs - moved to client component */}
        <EventDetailTabs eventData={eventData} />
      </RoundProvider>
    </>
  );
}
