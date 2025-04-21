import { format } from "date-fns";
import { fi } from "date-fns/locale";

// Helper function to determine status based on date
export function getStatusLabel(dateString: string) {
  const eventDate = new Date(dateString);
  const now = new Date();

  // Set time boundaries for "ongoing" status (1 hour before to 3 hours after start time)
  const ongoingStart = new Date(eventDate);
  ongoingStart.setHours(ongoingStart.getHours() - 1);

  const ongoingEnd = new Date(eventDate);
  ongoingEnd.setHours(ongoingEnd.getHours() + 3);

  if (now < ongoingStart) {
    return "Tuleva";
  } else if (now >= ongoingStart && now <= ongoingEnd) {
    return "Käynnissä";
  } else {
    return "Päättynyt";
  }
}

// Helper function to get status badge color
export function getStatusBadgeColor(dateString: string) {
  const status = getStatusLabel(dateString);
  switch (status) {
    case "Päättynyt":
      return "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800";
    case "Käynnissä":
      return "bg-amber-500 hover:bg-amber-600 dark:bg-amber-700 dark:hover:bg-amber-800";
    case "Tuleva":
      return "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800";
    default:
      return "bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-800";
  }
}

// Helper function to get venue type
export function getVenueType(type: number): string {
  switch (type) {
    case 1:
      return "Outdoor";
    case 2:
      return "Indoor";
    case 3:
      return "Indoor";
    default:
      return "Other";
  }
}

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
export function formatDate(dateString: string) {
  return format(new Date(dateString), "d.M.yyyy", { locale: fi });
}

// Format time for display
export function formatTime(dateString: string) {
  return format(new Date(dateString), "HH:mm", { locale: fi });
}
