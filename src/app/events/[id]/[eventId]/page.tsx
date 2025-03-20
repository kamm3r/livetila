import { api } from "~/trpc/server";
import { Button } from "~/@/components/ui/button";
import {
  ArrowLeft,
  RefreshCw,
  Clock,
  ChevronRight,
  Home,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fi } from "date-fns/locale";
import EventDetailTabs from "~/app/events/[id]/[eventId]/_components/event";
import { StatusIndicator } from "~/@/components/ui/status-indicator";
import { getStatusLabel } from "~/@/utils/event-utils";
import { CompetitionHeader } from "~/@/components/competition-header";
import { Rounds } from "~/@/components/rounds";
import { RoundProvider } from "~/@/components/round-provider";

// // Helper function to get qualification badge
// const QualificationBadge = ({
//   type,
// }: {
//   type: "Q" | "q" | "DQ" | undefined;
// }) => {
//   if (!type) return null;

//   switch (type) {
//     case "Q":
//       return (
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger>
//               <Badge className="ml-2 bg-green-600 hover:bg-green-700">Q</Badge>
//             </TooltipTrigger>
//             <TooltipContent>
//               <p>Direct Qualification</p>
//             </TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//       );
//     case "q":
//       return (
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger>
//               <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">q</Badge>
//             </TooltipTrigger>
//             <TooltipContent>
//               <p>Qualified by Time</p>
//             </TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//       );
//     case "DQ":
//       return (
//         <TooltipProvider>
//           <Tooltip>
//             <TooltipTrigger>
//               <Badge className="ml-2 bg-red-600 hover:bg-red-700">DQ</Badge>
//             </TooltipTrigger>
//             <TooltipContent>
//               <p>Disqualified</p>
//             </TooltipContent>
//           </Tooltip>
//         </TooltipProvider>
//       );
//     default:
//       return null;
//   }
// };

// Format date for display
const formatDate = (dateString: string) => {
  return format(new Date(dateString), "d.M.yyyy", { locale: fi });
};

// Format time for display
const formatTime = (dateString: string) => {
  return format(new Date(dateString), "HH:mm", { locale: fi });
};

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
    <div className="w-full px-4 py-6">
      <RoundProvider rounds={eventData.Rounds}>
        {/* Header */}
        <CompetitionHeader
          eventData={eventData}
          id={id}
          compData={compData}
          latestRound={latestRound!}
        />
        {/* Round selection and tabs - moved to client component */}
        <EventDetailTabs eventData={eventData} />
      </RoundProvider>
    </div>
  );
}
