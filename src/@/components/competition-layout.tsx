"use client";
import { CheckCircle } from "lucide-react";
import { useRound } from "~/@/components/round-provider";
import { Button } from "~/@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/@/components/ui/table";
import { formatTrackResult, sortByResult } from "~/@/lib/results";
import { cn } from "~/@/lib/utils";
import { api } from "~/trpc/react";
import type {
  Allocation,
  Competition,
  Enrollment,
  Heat,
  TotalResult,
} from "~/types/comp";

type Column<T> = {
  header: React.ReactNode;
  className?: string;
  cell: (row: T) => React.ReactNode;
};

type BaseTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  rowClassName?: (row: T) => string;
};

type AthleteRow = Enrollment | Allocation | TotalResult;

function NameAndOrg({
  name,
  organization,
  number,
}: {
  name: string;
  organization?: { Name: string } | null;
  number?: string | number | null;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        {!!number && (
          <span className="mr-2 rounded bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs dark:bg-blue-800 dark:text-blue-200">
            {number}
          </span>
        )}
        <span className="font-medium">{name}</span>
      </div>
      <div className="mt-1 text-muted-foreground text-xs">
        {organization?.Name ?? "-"}
      </div>
    </div>
  );
}

function HeatSelector({
  heats,
  selectedHeat,
  handleHeatChange,
}: {
  heats: Heat[];
  selectedHeat: number;
  handleHeatChange: (heat: number) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <div className="mb-2 w-full text-muted-foreground text-sm">
        Valitse erä:
      </div>
      {heats.map((heat) => (
        <Button
          key={heat.Index}
          onClick={() => handleHeatChange(heat.Index)}
          variant={selectedHeat === heat.Index ? "default" : "outline"}
        >
          Erä {heat.Index}
        </Button>
      ))}
    </div>
  );
}

function AttemptsList({
  attempts,
  bestResult,
}: {
  attempts: Array<{ Line1: string; Line2?: string }> | undefined;
  bestResult?: string | null;
}) {
  if (!attempts) return null;

  return (
    <ul className="flex gap-2">
      {attempts.map((attempt, index) => (
        <li
          className={cn(
            "-my-1 flex flex-col rounded bg-muted-foreground/20 px-2 py-1 text-sm",
            bestResult === attempt.Line1 &&
              "border-primary/20! bg-primary/10! text-primary",
          )}
          key={`${attempt.Line1}-${index}`}
        >
          <span>{attempt.Line1}</span>
          {attempt.Line2 && <span>{attempt.Line2}</span>}
        </li>
      ))}
    </ul>
  );
}

function BaseTable<T extends { Id: string | number }>({
  data,
  columns,
  rowClassName,
}: BaseTableProps<T>) {
  return (
    <Table className="hidden max-h-[600px] overflow-y-auto rounded-md border lg:block">
      <TableHeader className="sticky top-0 backdrop-blur-md">
        <TableRow>
          {columns.map((col, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fix later
            <TableHead className={col.className} key={i}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((row, i) => (
          <TableRow
            className={rowClassName ? rowClassName(row) : undefined}
            key={`${row.Id}-${i}`}
          >
            {columns.map((col, j) => (
              <TableCell key={`${row.Id}-${i}-${j}`}>{col.cell(row)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function BaseMobileCard({
  highlight,
  title,
  subtitle,
  meta,
}: {
  highlight?: boolean;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode; //TODO: better name
}) {
  return (
    <li
      className={cn(
        "rounded-lg border px-4 py-4",
        highlight && "bg-green-300/10",
      )}
    >
      <div className="flex flex-col gap-2">
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          <p className="text-muted-foreground text-xs">{subtitle ?? "-"}</p>
        </div>
        {meta}
      </div>
    </li>
  );
}

function PersonalBestsMeta({
  pb,
  sb,
}: {
  pb?: string | null;
  sb?: string | null;
}) {
  return (
    <div className="flex gap-3 text-xs opacity-70">
      <span>PB {pb || "-"}</span>
      <span>SB {sb || "-"}</span>
    </div>
  );
}

interface MobileListProps<T extends AthleteRow> {
  data: T[];
  getTitle: (item: T) => string;
  renderMeta?: (item: T) => React.ReactNode;
  isHighlighted?: (item: T) => boolean;
}

function MobileList<T extends AthleteRow>({
  data,
  getTitle,
  renderMeta,
  isHighlighted,
}: MobileListProps<T>) {
  return (
    <ul className="flex flex-col gap-4 lg:hidden">
      {data.map((item) => (
        <BaseMobileCard
          highlight={isHighlighted?.(item)}
          key={item.Id}
          meta={renderMeta?.(item)}
          subtitle={item.Organization?.Name}
          title={getTitle(item)}
        />
      ))}
    </ul>
  );
}

const nameAndOrgColumn = <T extends AthleteRow>(
  showNumber = false,
): Column<T> => ({
  header: "Nimi ja Seura",
  className: "w-full",
  cell: (row) => (
    <NameAndOrg
      name={row.Name}
      number={showNumber && "Number" in row ? row.Number : undefined}
      organization={row.Organization}
    />
  ),
});

const pbColumn = <T extends { PB?: string | null }>(): Column<T> => ({
  header: "PB",
  cell: (row) => <span className="font-medium">{row.PB || "-"}</span>,
});

const sbColumn = <T extends { SB?: string | null }>(): Column<T> => ({
  header: "SB",
  cell: (row) => <span className="font-medium">{row.SB || "-"}</span>,
});

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">
        Eräjakoja ei ole saatavilla vielä.
      </p>
    </div>
  );
}

export function ParticipantLayout({ athletes }: { athletes: Competition }) {
  const enrollments = athletes.Enrollments;
  return (
    <div className="space-y-6">
      <BaseTable
        columns={[
          {
            header: "Varm.",
            cell: (p) =>
              p.Confirmed ? (
                <div className="flex size-5 items-center justify-center">
                  <CheckCircle className="size-3 text-white" />
                </div>
              ) : null,
          },
          nameAndOrgColumn<Enrollment>(true),
          pbColumn<Enrollment>(),
          sbColumn<Enrollment>(),
        ]}
        data={enrollments}
        rowClassName={(p) =>
          p.Confirmed ? "bg-green-300/10 hover:bg-green-300/15" : ""
        }
      />
      <MobileList
        data={enrollments}
        getTitle={(p) => p.Name}
        isHighlighted={(p) => p.Confirmed}
        renderMeta={(p) => <PersonalBestsMeta pb={p.PB} sb={p.SB} />}
      />
    </div>
  );
}

export function ProtocolLayout({ isTrack }: { isTrack: boolean }) {
  const {
    currentHeat,
    selectedHeat,
    heats,
    showHeatNumbers,
    handleHeatChange,
  } = useRound();

  if (!currentHeat || heats.length === 0) {
    return <EmptyState />;
  }
  const allocations = [...currentHeat.Allocations];

  return (
    <div className="space-y-6">
      {showHeatNumbers && (
        <HeatSelector
          handleHeatChange={handleHeatChange}
          heats={heats}
          selectedHeat={selectedHeat}
        />
      )}
      <BaseTable
        columns={[
          {
            header: isTrack ? "Rata" : "Järjestys",
            className: "w-[100px]",
            cell: (a) => <span>{!a.Number ? "" : a.Number}</span>,
          },
          nameAndOrgColumn<Allocation>(true),
          pbColumn<Allocation>(),
          sbColumn<Allocation>(),
        ]}
        data={allocations}
      />
      <MobileList
        data={allocations}
        getTitle={(a) => `${!a.Number ? "" : a.Number} ${a.Name}`}
        renderMeta={(a) => <PersonalBestsMeta pb={a.PB} sb={a.SB} />}
      />
    </div>
  );
}

export function ResultLayout({
  compId,
  isProgress,
}: {
  compId: string;
  isProgress: boolean;
}) {
  const comp_athletes = api.competition.getAthletes.useQuery(
    { compId },
    {
      refetchInterval: isProgress ? 1000 : false,
      refetchIntervalInBackground: false,
      staleTime: 0,
    },
  );
  const {
    currentHeat,
    currentRound,
    selectedHeat,
    heats,
    showHeatNumbers,
    handleHeatChange,
  } = useRound();

  if (!currentHeat || heats.length === 0) {
    return <EmptyState />;
  }
  const eventCategory = comp_athletes.data?.EventCategory;
  const allocations = [...currentHeat.Allocations].sort((a, b) =>
    sortByResult(a, b, eventCategory || "Field"),
  );
  const totalResults = currentRound?.TotalResults?.slice().sort((a, b) =>
    sortByResult(a, b, eventCategory || "Field"),
  );

  const resultsColumns = (
    isHeatView: boolean,
  ): Column<Allocation | TotalResult>[] => [
    {
      header: "Sija",
      className: "w-[100px]",
      cell: (a) => <span>{isHeatView ? a.HeatRank : a.ResultRank}</span>,
    },
    nameAndOrgColumn(true),
    {
      header: "Tulos",
      cell: (a) => <AttemptsList attempts={a.Attempts} bestResult={a.Result} />,
    },
  ];

  return (
    <div className="space-y-6">
      {showHeatNumbers && heats.length > 1 && (
        <HeatSelector
          handleHeatChange={handleHeatChange}
          heats={heats}
          selectedHeat={selectedHeat}
        />
      )}
      <BaseTable columns={resultsColumns(true)} data={allocations} />
      <MobileList
        data={allocations}
        getTitle={(a) => `${!a.HeatRank ? "" : a.ResultRank} ${a.Name}`}
        renderMeta={(a) => (
          <AttemptsList attempts={a.Attempts} bestResult={a.Result} />
        )}
      />
      {heats.length > 1 && (
        <>
          <h3 className="scroll-m-20 font-semibold text-2xl tracking-tight">
            Kokonaistulokset
          </h3>
          <BaseTable
            columns={resultsColumns(false)}
            data={totalResults || []}
          />
          <MobileList
            data={totalResults || []}
            getTitle={(a) => `${!a.HeatRank ? "" : a.ResultRank} ${a.Name}`}
            renderMeta={(a) => (
              <AttemptsList attempts={a.Attempts} bestResult={a.Result} />
            )}
          />
        </>
      )}
    </div>
  );
}
