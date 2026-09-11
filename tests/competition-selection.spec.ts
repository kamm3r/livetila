import { expect, test } from "@playwright/test";
import {
  competitionEventLink,
  competitionRoundLink,
  findSelectedEvent,
  isCompetitionLink,
  overlayLink,
  parseCompetitionSlug,
  selectCompetitionRound,
  selectOverlayRound,
} from "../src/lib/competition-selection";
import type { Round } from "../src/types/comp";

const rounds = [
  {
    Index: 7,
    RoundTypeCategory: "Qualify",
    Heats: [{ Index: 12, Allocations: [] }],
    TotalResults: [],
  },
  {
    Index: 42,
    RoundTypeCategory: "Final",
    Heats: [
      { Index: 51, Allocations: [] },
      { Index: 90, Allocations: [] },
    ],
    TotalResults: [],
  },
] as unknown as Round[];

test("round and heat identities survive both URL formats", () => {
  const selection = selectCompetitionRound(rounds, "Final", {
    round: 42,
    heat: 90,
  });
  expect(selection.round?.Index).toBe(42);
  expect(selection.heat?.Index).toBe(90);
  const link = overlayLink("1-10", rounds, {
    round: selection.round!.Index,
    heat: selection.heat!.Index,
  });
  expect(link).toBe("/obs/1-10?round=2&heat=2");
  const decoded = selectOverlayRound(
    rounds,
    new URL(link, "https://example.test").searchParams,
  );
  expect(decoded.round).toBe(selection.round);
  expect(decoded.heat).toBe(selection.heat);
  const url = new URL("https://example.test/competition/1-10?foo=keep");
  expect(competitionRoundLink(url, rounds, 7)?.search).toBe(
    "?foo=keep&round=Qualify",
  );
  expect(url.search).toBe("?foo=keep");
  expect(competitionRoundLink(url, rounds, 99)).toBeNull();
});

test("selection defaults and invalid heats stay distinct for competition and OBS", () => {
  expect(selectCompetitionRound(rounds, "missing").round?.Index).toBe(42);
  expect(
    selectCompetitionRound(rounds, "Qualify", { round: 42, heat: 90 }).heat
      ?.Index,
  ).toBe(12);
  expect(
    selectCompetitionRound(rounds, "Final", { round: 42, heat: 999 }).heat
      ?.Index,
  ).toBe(51);
  expect(selectCompetitionRound([]).round).toBeUndefined();
  expect(selectOverlayRound(rounds, new URLSearchParams()).round?.Index).toBe(
    7,
  );
  for (const heat of ["0", "99", "1.5", "invalid"]) {
    const result = selectOverlayRound(
      rounds,
      new URLSearchParams({ round: "2", heat }),
    );
    expect(result.heat).toBeUndefined();
    expect(result.allocations).toEqual([]);
  }
  expect(
    selectOverlayRound(rounds, new URLSearchParams("round=99")).round,
  ).toBeUndefined();
});

test("event links distinguish rounds sharing an event ID", () => {
  const events = [
    { EventId: 10, Name: "Alkuerät" },
    { EventId: 10, Name: "Loppukilpailu" },
  ];
  expect(competitionEventLink(1, events[0]!)).toBe(
    "/competition/1-10?round=Qualify",
  );
  expect(competitionEventLink(1, events[1]!)).toBe(
    "/competition/1-10?round=Final",
  );
  expect(findSelectedEvent(events, "10", "Final")).toBe(events[1]);
  expect(findSelectedEvent(events, "10", "missing")).toBe(events[0]);
  expect(findSelectedEvent(events, "20")).toBeUndefined();
});

test("only complete numeric competition identities and local history links are accepted", () => {
  expect(parseCompetitionSlug("12-34")).toEqual({
    competitionId: "12",
    eventId: "34",
  });
  for (const slug of ["", "1", "1-", "a-b", "1-2-extra", "1-2/3"])
    expect(parseCompetitionSlug(slug)).toBeNull();
  expect(isCompetitionLink("/competition/12-34?round=Final")).toBe(true);
  for (const url of [
    "https://evil.test/competition/1-2",
    "//evil.test",
    "/competition/a-b",
    "/competition/1-2?round=Final&redirect=x",
  ])
    expect(isCompetitionLink(url)).toBe(false);
});
