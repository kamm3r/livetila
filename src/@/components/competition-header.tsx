import { format } from "date-fns";
import { fi } from "date-fns/locale";
import { ArrowLeft, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { CopytoClipboard } from "~/@/components/copy-to-clipboard";
import { Rounds } from "~/@/components/rounds";
// import { Badge } from "~/@/components/ui/badge";
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
  dataEvent,
  id,
  dataComp,
  latestRound,
  slug,
}: {
  dataEvent: Competition;
  id: string;
  dataComp: CompetitionProperties;
  latestRound: Round;
  slug: string;
}) {
  return (
    <div className="container mx-auto overflow-hidden border-r border-l">
      <div className="border-t border-b p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-2">
            <Trophy className="mt-0.5 h-5 w-5" />
            <div className="flex flex-col gap-0.5">
              <h1 className="text-lg leading-tight font-semibold">
                {dataEvent.Name}
              </h1>
              <div className="flex items-center text-xs">
                <span className="bg-foreground mr-1.5 inline-block h-1.5 w-1.5 rounded-full"></span>
                {dataEvent.EventType.Category} -{" "}
                {dataEvent.EventType.SubCategory}
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 sm:mt-0 sm:justify-end">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {formatTime(
                  latestRound?.BeginDateTimeWithTZ ||
                    dataEvent.BeginDateTimeWithTZ,
                )}
              </span>
            </div>
            <CopytoClipboard slug={slug} />
          </div>
        </div>
      </div>

      <div className="border-b p-2 px-3">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/events/${id}`}>
                {dataComp.Competition.Name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium">
                {dataEvent.Name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex w-full border-b">
        <div className="flex w-full justify-between">
          <Link href={`/events/${id}`}>
            <Button
              variant="link"
              size="sm"
              className="h-8 px-2 text-xs font-medium md:text-sm"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Takaisin kilpailuun
            </Button>
          </Link>
          <Rounds competition={dataEvent} />
        </div>
      </div>
    </div>
  );
}
