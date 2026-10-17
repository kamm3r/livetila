import { expect, test } from "@playwright/test";
import {
  onlineConfirmation,
  usesOnlineConfirmation,
} from "../src/lib/online-confirmation";
import type {
  CompetitionDetails,
  CompetitionProperties,
} from "../src/types/comp";

// Event starts 18:00 local time on 9.9.; confirmation opens the day before
// and closes an hour before the start.
const portal = {
  Id: 20830,
  ConfirmationDeadlineInMinutes: 60,
  ConfirmationOpensWindowInDays: 1,
} as CompetitionDetails;
const begin = new Date(2026, 8, 9, 18).toISOString();
const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 8, day, hour, minute).getTime();

test("confirmation is offered from the opening day until the deadline", () => {
  const result = onlineConfirmation(portal, begin, at(8, 0));
  expect(result?.url).toBe("https://www.tuloslista.com/varmistus/#!/20830");
  expect(result?.deadline.getTime()).toBe(at(9, 17));
  expect(onlineConfirmation(portal, begin, at(9, 16, 59))).not.toBeNull();
});

test("confirmation is hidden before it opens and after the deadline", () => {
  expect(onlineConfirmation(portal, begin, at(7, 23, 59))).toBeNull();
  expect(onlineConfirmation(portal, begin, at(9, 17))).toBeNull();
});

test("competitions missing from the portal or without a start time get none", () => {
  expect(onlineConfirmation(undefined, begin, at(9, 12))).toBeNull();
  expect(onlineConfirmation(portal, undefined, at(9, 12))).toBeNull();
});

test("the properties setting tells whether to ask the portal", () => {
  const properties = (StringValue?: string) =>
    ({
      Settings: StringValue ? [{ Type: 1, StringValue, IntValue: 60 }] : [],
    }) as unknown as CompetitionProperties;
  expect(usesOnlineConfirmation(properties("on"))).toBe(true);
  expect(usesOnlineConfirmation(properties("off"))).toBe(false);
  expect(usesOnlineConfirmation(properties())).toBe(false);
  expect(usesOnlineConfirmation(null)).toBe(false);
});
