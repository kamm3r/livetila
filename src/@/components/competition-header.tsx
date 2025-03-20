import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { ArrowLeft, Clock, RefreshCw, Trophy } from "lucide-react";
import Link from "next/link";
import { Rounds } from "~/@/components/rounds";
import { Badge } from "~/@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/@/components/ui/breadcrumb";
import { Button } from "~/@/components/ui/button";
import {
  type CompetitionProperties,
  type Competition,
  type Round,
} from "~/types/comp";

function formatTime(dateString: string) {
  return format(new Date(dateString), "HH:mm", { locale: fi });
}

export function CompetitionHeader({
  eventData,
  id,
  compData,
  latestRound,
}: {
  eventData: Competition;
  id: string;
  compData: CompetitionProperties;
  latestRound: Round;
}) {
  return (
    <div className="overflow-hidden rounded-t-lg">
      <div className="bg-blue-600 p-3 text-white sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-2">
            <Trophy className="mt-0.5 h-5 w-5" />
            <div className="flex flex-col gap-0.5">
              <h1 className="text-lg leading-tight font-semibold">
                {eventData.Name}
              </h1>
              <div className="flex items-center text-xs text-blue-200">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-300"></span>
                {eventData.EventType.Category} -{" "}
                {eventData.EventType.SubCategory}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 sm:mt-0 sm:justify-end">
            {/* {eventData. === "completed" && (
              <Badge
                variant="secondary"
                className="bg-green-500 text-white hover:bg-green-500"
              >
                Completed
              </Badge>
            )} */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {formatTime(
                  latestRound?.BeginDateTimeWithTZ ||
                    eventData.BeginDateTimeWithTZ,
                )}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              //   onClick={onRefresh}
              className="border-blue-500 bg-blue-700 text-xs hover:bg-blue-800"
            >
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Päivitä
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-2 px-3 dark:bg-blue-950">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/events/${id}`}>
                {compData.Competition.Name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">
                {eventData.Name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="border-b bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between px-3 py-2">
          <Link href={`/events/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-md text-xs text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Takaisin kilpailuun
            </Button>
          </Link>
          <Rounds eventData={eventData} />
        </div>
      </div>
    </div>
  );
}
