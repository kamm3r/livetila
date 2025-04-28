// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "~/@/components/ui/table";
// import { InfoIcon, Loader2Icon } from "lucide-react";
// // import { Button } from "~/@/components/ui/button";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "~/@/components/ui/popover";
// import { Navbar } from "~/@/components/navbar";
// import { Embed } from "~/@/components/embed";
import { api } from "~/trpc/server";
// import { Suspense, use } from "react";
// import { Skeleton } from "~/@/components/ui/skeleton";

import type React from "react";

import { EventsPage } from "~/app/events/[id]/_components/das";
import { EventsHeader } from "~/@/components/events-header";

// function butterParse(a: string): number {
//   if (a === "NM" || Number.isNaN(a)) {
//     return 0;
//   } else if (a === null) {
//     return 0;
//   } else if (a === "DNS" || a === "DQ" || a === "DNF" || a === "DSQ") {
//     return -1;
//   } else {
//     return parseFloat(a);
//   }
// }

// function getClubImg(club: string) {
//   return `https://www.tilastopaja.info/fi/db/pics/png/${club}.png`;
// }

export default async function Comp({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: cachedEventId } = await params;
  const competitionData = await api.competition.getEvents({
    competitionId: cachedEventId,
  });
  const compDetailsData = await api.competition.getCompetitionDetails({
    competitionDetailsId: cachedEventId,
  });

  return (
    <>
      <EventsHeader competitionData={compDetailsData} />
      <EventsPage
        data={competitionData}
        details={compDetailsData}
        competitionId={cachedEventId}
      />
    </>
  );
}
