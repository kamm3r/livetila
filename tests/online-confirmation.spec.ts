import { expect, test } from "@playwright/test";
import { onlineConfirmation } from "../src/lib/online-confirmation";
import type { CompetitionProperties } from "../src/types/comp";

const properties = (
  settings: Partial<CompetitionProperties["Settings"][0]>[],
) =>
  ({
    Settings: settings,
    Competition: { Id: 20830, ConfirmationDeadlineInMinutes: 0 },
  }) as unknown as CompetitionProperties;

test("an enabled setting links the portal with the event's deadline", () => {
  const result = onlineConfirmation(
    properties([{ Type: 1, StringValue: "on", IntValue: 60 }]),
    "2026-09-09T18:00:00+03:00",
  );
  expect(result?.url).toBe("https://www.tuloslista.com/varmistus/#!/20830");
  expect(result?.deadline?.toISOString()).toBe("2026-09-09T14:00:00.000Z");
});

test("competitions without online confirmation get no link", () => {
  expect(onlineConfirmation(properties([]), "2026-09-09T18:00:00Z")).toBeNull();
  expect(
    onlineConfirmation(
      properties([{ Type: 1, StringValue: "off", IntValue: 60 }]),
      "2026-09-09T18:00:00Z",
    ),
  ).toBeNull();
  expect(onlineConfirmation(null, undefined)).toBeNull();
});

test("an invalid event time keeps the link without a deadline", () => {
  const result = onlineConfirmation(
    properties([{ Type: 1, StringValue: "on", IntValue: 45 }]),
    undefined,
  );
  expect(result?.deadline).toBeNull();
});
