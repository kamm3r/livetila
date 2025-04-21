import { ArrowLeft, Calendar, Home, Trophy } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "~/@/components/ui/breadcrumb";
import { Button } from "~/@/components/ui/button";
import { formatDate } from "~/@/utils/event-utils";
import { type CompetitionProperties } from "~/types/comp";

export function EventsHeader({
  competitionData,
}: {
  competitionData: CompetitionProperties;
}) {
  return (
    <div className="overflow-hidden border-r border-l">
      <div className="border-t border-b p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Trophy className="h-5 w-5" />
            <div className="flex flex-col gap-0.5">
              <h1 className="text-lg leading-tight font-semibold">
                {competitionData?.Competition.Name}
              </h1>
              <div className="flex items-center text-xs opacity-30">
                <span>{competitionData?.Competition.Organization}</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 sm:mt-0 sm:justify-end">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {/* @ts-expect-error TODO: Fix this */}
                {formatDate(competitionData?.Competition.BeginDate ?? "")}
              </span>
            </div>
            {/* <p className="ml-1">
              Valitse laji, jonka tuloksia haluat tarkastella tarkemmin.
            </p> */}
          </div>
        </div>
      </div>
      <div className="border-b p-2 px-3">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex gap-1">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                {competitionData.Competition.Name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="border-b">
        <div className="flex items-center justify-between px-3 py-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-md text-xs"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Takaisin etusivulle
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
