// Example data for the OBS link popover's preview, shaped like the event it
// is opened from: throws and horizontal jumps get a series of marks, vertical
// jumps a series of heights, running events a heat that gets its times.
import { isTimed } from "$lib/results";
import type { Allocation, EventCategory } from "~/types/comp";
import type { OverlayEntry } from "$lib/components/overlay/overlay";

export type ExampleKind = "distance" | "height" | "time";

export function exampleKind(
  eventCategory: EventCategory,
  eventName = "",
  vertical = false,
): ExampleKind {
  if (isTimed(eventCategory)) return "time";
  return vertical || /korkeus|seiväs|high jump|pole/i.test(eventName)
    ? "height"
    : "distance";
}

// Typical winning marks, so a shot put example is not thrown 80 metres.
const distanceScale = (eventName: string) => {
  const name = eventName.toLowerCase();
  const typical = [
    [/kuula|shot/, 20],
    [/kiekko|discus/, 63],
    [/moukari|hammer/, 76],
    [/kolmiloikka|triple/, 16.5],
    [/pituus|long/, 7.9],
  ] as const;
  const match = typical.find(([pattern]) => pattern.test(name));
  return (match?.[1] ?? 80) / 80;
};

const heightScale = (eventName: string) =>
  /seiväs|pole/i.test(eventName) ? 5.6 / 2.2 : 1;

// Seconds a winner takes over the distance, from the event's name.
function winningTime(eventName: string) {
  const relay = /(\d)\s*[x×]\s*(\d+)/i.exec(eventName);
  const metres = relay
    ? Number(relay[1]) * Number(relay[2])
    : Number(/(\d+)\s*m/i.exec(eventName)?.[1] ?? 100);
  const table: [number, number][] = [
    [100, 10.5],
    [200, 21.3],
    [400, 46.8],
    [800, 108],
    [1500, 222],
    [3000, 480],
    [5000, 810],
    [10000, 1690],
  ];
  const known = table.find(([distance]) => distance >= metres) ?? table.at(-1)!;
  return (known[1] * metres) / known[0];
}

// "10,52", "1.52,31": Finnish result notation.
function formatTime(seconds: number) {
  const whole = Math.floor(seconds);
  const hundredths = String(Math.round((seconds - whole) * 100)).padStart(
    2,
    "0",
  );
  if (whole < 60) return `${whole},${hundredths}`;
  const minutes = Math.floor(whole / 60);
  return `${minutes}.${String(whole % 60).padStart(2, "0")},${hundredths}`;
}

const names = [
  ["Helander", "Kuortaneen Kunto"],
  ["Kuusela", "Lapuan Virkiä"],
  ["Etelätalo", "Keuruun Kisailijat"],
  ["Laine", "Pihtiputaan Pyrintö"],
  ["Karstila", "LahtiSport"],
] as const;

type Attempt = { Line1: string; Line2: string | null };

// Round four of a final: the fifth athlete fouls (phase 1), then the fourth
// takes the lead (phase 2).
function distanceSeries(phase: number, scale: number): Attempt[][] {
  const marks = [
    ["78.20", "x", "80.11"],
    ["76.44", "77.90", "x"],
    ["x", "75.12", "76.80"],
    ["73.01", "x", "74.66"],
    ["70.12", "72.03", "71.55"],
  ].map((series) => [...series]);
  if (phase >= 1) marks[4]!.push("x");
  if (phase >= 2) marks[3]!.push("81.37");
  return marks.map((series) =>
    series.map((mark) => ({
      Line1: mark === "x" ? mark : (Number(mark) * scale).toFixed(2),
      Line2: null,
    })),
  );
}

// Heights with their tries: the fifth athlete fails, then the fourth clears
// a new best.
function heightSeries(phase: number, scale: number): Attempt[][] {
  const series: [string, string][][] = [
    [
      ["2.05", "o"],
      ["2.10", "o"],
      ["2.14", "o"],
      ["2.17", "xo"],
      ["2.20", "o"],
    ],
    [
      ["2.05", "o"],
      ["2.10", "xo"],
      ["2.14", "o"],
      ["2.17", "o"],
    ],
    [
      ["2.05", "o"],
      ["2.10", "o"],
      ["2.14", "xxo"],
    ],
    [
      ["2.05", "xo"],
      ["2.10", "o"],
    ],
    [["2.05", "o"]],
  ];
  if (phase >= 1) series[4]!.push(["2.10", "xxx"]);
  if (phase >= 2) series[3]!.push(["2.23", "xo"]);
  return series.map((list) =>
    list.map(([height, tries]) => ({
      Line1: (Number(height) * scale).toFixed(2),
      Line2: tries,
    })),
  );
}

const cleared = (attempt: Attempt) =>
  attempt.Line2 ? /o/i.test(attempt.Line2) : attempt.Line1 !== "x";

// Who the athlete is; the marks stay the example's.
const identity = (entry?: Allocation) =>
  entry && {
    Name: entry.Name,
    Firstname: entry.Firstname,
    Surname: entry.Surname,
    Organization: entry.Organization,
    Athletes: entry.Athletes,
  };

// Phase 0 is the starting point, 1 and 2 the two changes the preview shows.
// The first athletes in protocol order replace the example names.
export function buildExample(
  kind: ExampleKind,
  eventName: string,
  phase: number,
  real: Allocation[],
): OverlayEntry[] {
  const base = names.map(([surname, club], i) => ({
    Id: i + 1,
    Name: surname,
    Surname: surname,
    Organization: { Id: i + 1, Name: club },
    ...identity(real[i]),
    Position: i + 1,
  }));

  if (kind === "time") {
    // A heat in lane order; the times arrive with phase 2.
    const winner = winningTime(eventName);
    const finish = [1.012, 1.004, 1.021, 1, 1.009];
    // The winner runs a season best and the runner-up a personal best, so
    // the preview shows the record banners.
    const records = [{}, { PB: 1.006 }, {}, { SB: 1.003 }, {}];
    const entries = base.map((entry, i) => {
      const result = phase >= 2 ? formatTime(winner * finish[i]!) : "";
      const record = records[i] as { PB?: number; SB?: number };
      return {
        ...entry,
        Attempts: result ? [{ Line1: result, Line2: null }] : [],
        Result: result,
        PB: record.PB ? formatTime(winner * record.PB) : "",
        SB: record.SB ? formatTime(winner * record.SB) : "",
      };
    });
    const order =
      phase >= 2
        ? [...entries].sort((a, b) => finish[a.Id - 1]! - finish[b.Id - 1]!)
        : entries;
    return order.map(
      (entry, i) =>
        ({
          ...entry,
          ResultRank: phase >= 2 ? i + 1 : 0,
          HeatRank: phase >= 2 ? i + 1 : 0,
        }) as unknown as OverlayEntry,
    );
  }

  const series =
    kind === "height"
      ? heightSeries(phase, heightScale(eventName))
      : distanceSeries(phase, distanceScale(eventName));
  return (
    base
      .map((entry, i) => {
        const attempts = series[i]!;
        const best = Math.max(
          0,
          ...attempts.filter(cleared).map((attempt) => Number(attempt.Line1)),
        );
        return { ...entry, Attempts: attempts, Result: best.toFixed(2) };
      })
      .sort((a, b) => Number(b.Result) - Number(a.Result))
      // Example data only fills the fields the overlay reads.
      .map(
        (entry, i) =>
          ({ ...entry, ResultRank: i + 1 }) as unknown as OverlayEntry,
      )
  );
}
