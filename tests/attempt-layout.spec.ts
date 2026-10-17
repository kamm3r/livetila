import { expect, test } from "@playwright/test";
import { attemptLayout } from "../src/lib/attempt-layout";

const marks = (values: string[]) => [
  { Attempts: values.map((Line1) => ({ Line1, Line2: "" })) },
];

test("horizontal jumps and throws show all six slots before results arrive", () => {
  for (const type of ["HorizontalJump", "Throw"]) {
    for (const entries of [[], marks([]), marks(["x"])])
      expect(attemptLayout(entries, "Field", type).labels).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
      ]);
  }
  expect(
    attemptLayout(marks(["7,10"]), "Field", "HorizontalJump", true).labels,
  ).toHaveLength(3);
  expect(
    attemptLayout(marks(Array(7).fill("7,10")), "Field", "HorizontalJump")
      .labels,
  ).toHaveLength(7);
  expect(
    attemptLayout(marks(["12,00", "11,90"]), "Track", "Track").labels,
  ).toEqual([]);
});

test("vertical jumps use every distinct height, including different starting heights", () => {
  const entries = [
    {
      Attempts: [
        { Line1: "1,60", Line2: "xo" },
        { Line1: "1,70", Line2: "xxx" },
      ],
    },
    {
      Attempts: [
        { Line1: "1,50", Line2: "o" },
        { Line1: "1,60", Line2: "o" },
      ],
    },
  ];
  expect(attemptLayout(entries, "Field", "VerticalJump")).toEqual({
    vertical: true,
    labels: ["1,50", "1,60", "1,70"],
  });
  expect(attemptLayout(entries, "Field").vertical).toBe(true);
  expect(
    attemptLayout(
      [{ Attempts: [{ Line1: "7,10", Line2: "-" }] }],
      "Field",
      "HorizontalJump",
    ).vertical,
  ).toBe(false);
  expect(
    attemptLayout(
      marks(Array.from({ length: 8 }, (_, i) => String(150 + i * 5))),
      "Field",
      "VerticalJump",
    ).labels,
  ).toHaveLength(8);
});
