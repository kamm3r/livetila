import { expect, test } from "@playwright/test";
import { sortByResult } from "../src/lib/results";

test("official heat and overall ranks resolve identical displayed results", () => {
  const results = [
    { Name: "Second", Result: "6,50", HeatRank: 2, ResultRank: 1 },
    { Name: "First", Result: "6,50", HeatRank: 1, ResultRank: 2 },
  ];
  expect(
    [...results]
      .sort((a, b) => sortByResult(a, b, "Field", "HeatRank"))
      .map((result) => result.Name),
  ).toEqual(["First", "Second"]);
  expect(
    [...results]
      .sort((a, b) => sortByResult(a, b, "Field", "ResultRank"))
      .map((result) => result.Name),
  ).toEqual(["Second", "First"]);
});

test("unranked live results retain numeric sorting and invalid results go last", () => {
  const results = [
    { Result: "DNF" },
    { Result: "" },
    { Result: "12,50" },
    { Result: "10,20" },
  ];
  expect(results.sort((a, b) => sortByResult(a, b, "Track"))).toEqual([
    { Result: "10,20" },
    { Result: "12,50" },
    { Result: "" },
    { Result: "DNF" },
  ]);
  expect(
    sortByResult({ Result: "6,50" }, { Result: "7,00" }, "Field"),
  ).toBeGreaterThan(0);
});

test("ranked athletes precede missing or invalid ranks without losing fallback ordering", () => {
  const results = [
    { Result: "10,00", ResultRank: 0 },
    { Result: "11,00", ResultRank: NaN },
    { Result: "12,00", ResultRank: 1 },
    { Result: "DNF", ResultRank: -1 },
  ];
  expect(
    results
      .sort((a, b) => sortByResult(a, b, "Track"))
      .map((result) => result.Result),
  ).toEqual(["12,00", "10,00", "11,00", "DNF"]);
});
