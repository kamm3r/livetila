import { api } from "~/trpc/server";
import { EventsList } from "./_components/events-list";

export default async function Home() {
  const competitions = await api.competition.getCompetitions();

  return <EventsList competitions={competitions} />;
}
