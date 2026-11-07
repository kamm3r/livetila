import { expect, test, type Page } from "@playwright/test";

// The four overlay styles offered in the broadcast graphics popover:
// Lista (broadcast-trail-plain), Tikkeri (ticker), Lopputulokset
// (broadcast-results) and Aikataulu (timetable).

type Attempt = { Line1: string; Line2: string };

const jumper = (
  id: number,
  first: string,
  last: string,
  result: string,
  attempts: string[],
) => ({
  Id: id,
  AllocId: 100 + id,
  Name: `${first} ${last}`,
  Firstname: first,
  Surname: last,
  Result: result,
  Position: id,
  HeatRank: 0,
  ResultRank: 0,
  Organization: { Name: "Club" },
  Attempts: attempts.map((Line1): Attempt => ({ Line1, Line2: "" })),
});

// Start order Korhonen, Virtanen, Mäkinen; Mäkinen jumped last.
const field = () => [
  jumper(1, "Aino", "Korhonen", "7,10", ["7,10", "6,20"]),
  jumper(2, "Ella", "Virtanen", "6,92", ["x", "6,92"]),
  jumper(3, "Sofia", "Mäkinen", "6,75", ["6,75", "x"]),
];

const runner = (id: number, name: string, lane: number) => ({
  Id: id,
  AllocId: 100 + id,
  Name: name,
  Result: null as string | null,
  Position: lane,
  HeatRank: 0,
  ResultRank: 0,
  Organization: { Name: "Club" },
  Attempts: null,
});

// Virtanen's third jump; a valid mark of 7,20 takes the lead.
const virtanenJumps = (mark: string) =>
  field().map((entry) =>
    entry.Id !== 2
      ? entry
      : {
          ...entry,
          Result: mark === "x" ? entry.Result : mark,
          Attempts: [...entry.Attempts, { Line1: mark, Line2: "" }],
        },
  );

type Entry = ReturnType<typeof jumper> | ReturnType<typeof runner>;

// Serves one live round; `set` swaps what the next poll returns.
async function serve(
  page: Page,
  initial: Entry[],
  category: "Field" | "Track" = "Field",
) {
  let entries = initial;
  await page.route("https://live.tuloslista.com/api/v1/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith("/properties"))
      return route.fulfill({
        json: { Competition: { Name: "Kalevan kisat" } },
      });
    if (!path.includes("/results/")) return route.fulfill({ json: {} });
    return route.fulfill({
      json: {
        Name: category === "Field" ? "Pituushyppy N" : "100 m M",
        EventCategory: category,
        EventSubCategory: category === "Field" ? "HorizontalJump" : undefined,
        Enrollments: [],
        Rounds: [
          {
            Index: 1,
            Name: "Loppukilpailu",
            RoundTypeCategory: "Final",
            Status: "Progress",
            Heats: [{ Index: 1, Allocations: entries }],
            TotalResults: entries,
          },
        ],
      },
    });
  });
  return {
    set: (next: Entry[]) => {
      entries = next;
    },
  };
}

const visibleText = (page: Page, text: string | RegExp) =>
  page
    .getByText(text, { exact: typeof text === "string" })
    .filter({ visible: true })
    .first();

// Lista nests each athlete's series inside their row.
const standings = (page: Page) =>
  page.locator("ol:not([data-attempt-details]) > li").filter({ visible: true });

test.describe("style selection", () => {
  for (const query of ["", "&style=tower", "&style=classic"]) {
    test(`a missing or retired style shows Lista: ${query || "none"}`, async ({
      page,
    }) => {
      await serve(page, field());
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/overlay/1-10?heat=1${query}`);
      await expect(visibleText(page, "Loppukilpailu")).toBeVisible();
      await expect(visibleText(page, "Tulos")).toBeVisible();
      await expect(page.locator("[data-attempt-details]")).toHaveCount(1);
      await expect(page.getByText("LIVE", { exact: true })).toHaveCount(0);
    });
  }
});

test.describe("Lista", () => {
  test("opens the series of the athlete who jumped last and measures the others against them", async ({
    page,
  }) => {
    await serve(page, field());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/overlay/1-10?heat=1&style=broadcast-trail-plain");
    const rows = standings(page);
    await expect(rows.nth(0)).toContainText("Korhonen");
    await expect(rows.nth(1)).toContainText("Virtanen");
    await expect(rows.nth(2)).toContainText("Mäkinen");

    const series = page.locator("[data-attempt-details]");
    await expect(series).toHaveCount(1);
    await expect(rows.nth(2)).toContainText("Mäkinen");
    await expect(series.locator("li")).toHaveCount(6);
    await expect(series.locator("li").nth(0)).toContainText("6,75");
    await expect(series.locator("li").nth(1)).toContainText("x");

    await expect(rows.nth(0)).toContainText("+0,35");
    await expect(rows.nth(1)).toContainText("+0,17");
    await expect(rows.nth(0)).toContainText("7,10m");
  });

  test("?gap=0 hides the gaps and ?accent recolours the frame", async ({
    page,
  }) => {
    await serve(page, field());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(
      "/overlay/1-10?heat=1&style=broadcast-trail-plain&gap=0&accent=ff8800",
    );
    await expect(visibleText(page, "7,10m")).toBeVisible();
    await expect(page.getByText("+0,35")).toHaveCount(0);
    await expect(page.locator('[style*="--accent: #ff8800"]')).toHaveCount(1);
  });

  test("?records=0 hides the SB and PB tags", async ({ page }) => {
    const withPb = () =>
      field().map((entry) =>
        entry.Id === 1 ? { ...entry, PB: "7,05", SB: "7,05" } : entry,
      );
    await serve(page, withPb());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/overlay/1-10?heat=1&style=broadcast-trail-plain");
    const rows = standings(page);
    await expect(rows.nth(0)).toContainText("PB");

    await page.goto(
      "/overlay/1-10?heat=1&style=broadcast-trail-plain&records=0",
    );
    await expect(rows.nth(0)).toContainText("Korhonen");
    await expect(rows.nth(0)).not.toContainText("PB");
  });

  test("a new attempt shows as pending before the mark and the new order land", async ({
    page,
  }) => {
    const server = await serve(page, field());
    await page.clock.install();
    await page.goto("/overlay/1-10?heat=1&style=broadcast-trail-plain");
    const rows = standings(page);
    await expect(rows.nth(0)).toContainText("Korhonen");

    server.set(virtanenJumps("7,20"));
    await page.clock.runFor(30_000);
    const series = page.locator("[data-attempt-details]");
    // Virtanen's series opens on three dots; the standings have not moved.
    await expect(series.locator(".waiting")).toHaveCount(1);
    await expect(rows.nth(0)).toContainText("Korhonen");

    await page.clock.runFor(2_000);
    await expect(series.locator(".waiting")).toHaveCount(0);
    await expect(series.locator("li").nth(2)).toContainText("7,20");
    await expect(rows.nth(0)).toContainText("Virtanen");
    await expect(rows.nth(1)).toContainText("Korhonen");
    await expect(rows.nth(1)).toContainText("−0,10");
  });

  test("a running event goes from start list to results as the times come in", async ({
    page,
  }) => {
    const slow = runner(1, "Slow Runner", 4);
    const fast = runner(2, "Fast Runner", 5);
    const server = await serve(page, [slow, fast], "Track");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/overlay/1-10?heat=1&style=broadcast-trail-plain");
    await expect(visibleText(page, "Loppukilpailu – Lähtölista")).toBeVisible();
    const rows = standings(page);
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("4");

    server.set([slow, { ...fast, Result: "10,20", HeatRank: 1 }]);
    await page.clock.runFor(30_000);
    await expect(visibleText(page, "Loppukilpailu – Tulokset")).toBeVisible();
    // Runners without a time wait off the board while times still arrive.
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0)).toContainText("10,20");

    await page.clock.runFor(5_000);
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(1).getByLabel("Odottaa maalikameraa")).toBeVisible();
  });
});

test.describe("Tikkeri", () => {
  test("scrolls the standings and calls out a new attempt for a few seconds", async ({
    page,
  }) => {
    const server = await serve(page, field());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/overlay/1-10?heat=1&style=ticker");
    for (const name of ["Korhonen", "Virtanen", "Mäkinen"])
      await expect(visibleText(page, name)).toBeVisible();
    await expect(visibleText(page, "LIVE")).toBeVisible();
    const callout = page.getByRole("status");
    await expect(callout).toHaveCount(0);

    server.set(virtanenJumps("7,20"));
    await page.clock.runFor(30_000);
    await expect(callout).toContainText("Yritys 3");
    await expect(callout).toContainText("Virtanen");
    await expect(callout).toContainText("7,20");
    await expect(callout).toContainText("Sija 1");
    await expect(callout).toContainText("▲1");

    await page.clock.runFor(4_001);
    await expect(callout).toHaveCount(0);
  });
});

test.describe("Lopputulokset", () => {
  test("lists the final standings with each athlete's gap to the winner", async ({
    page,
  }) => {
    await serve(page, field());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/overlay/1-10?heat=1&style=broadcast-results");
    await expect(visibleText(page, "Tulokset – Loppukilpailu")).toBeVisible();
    const rows = page.locator("ol > li");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText("1");
    await expect(rows.nth(0)).toContainText("Aino");
    await expect(rows.nth(0)).toContainText("Club");
    await expect(rows.nth(0)).toContainText("7,10m");
    await expect(rows.nth(1)).toContainText("−0,18m");
    await expect(rows.nth(2)).toContainText("−0,35m");
    await expect(visibleText(page, "Ero")).toBeVisible();
    await expect(visibleText(page, "Kalevan kisat")).toBeVisible();
  });

  test("?gap=0 leaves out the gap column", async ({ page }) => {
    await serve(page, field());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/overlay/1-10?heat=1&style=broadcast-results&gap=0");
    await expect(visibleText(page, "7,10m")).toBeVisible();
    await expect(page.getByText("Ero", { exact: true })).toHaveCount(0);
    await expect(page.getByText("−0,18")).toHaveCount(0);
  });
});

test.describe("Aikataulu", () => {
  test.use({ timezoneId: "Europe/Helsinki" });

  test("pages through the day's events and marks the one in progress", async ({
    page,
  }) => {
    const events = Array.from({ length: 12 }, (_, i) => ({
      Id: i + 1,
      EventId: 10 + i,
      EventName: `Laji ${i + 1}`,
      Name: "Loppukilpailu",
      Category: "Track",
      Status: i === 0 ? "Official" : i === 1 ? "Progress" : "Scheduled",
      BeginDateTimeWithTZ: `2026-09-09T${String(9 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}:00+03:00`,
    }));
    await page.route("https://live.tuloslista.com/api/v1/**", (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/properties"))
        return route.fulfill({
          json: { Competition: { Name: "Kalevan kisat" } },
        });
      if (path === "/api/v1/competition/1")
        return route.fulfill({ json: { "09.09.2026": events } });
      return route.fulfill({ json: {} });
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/overlay/1-10?style=timetable");
    await expect(visibleText(page, "Aikataulu")).toBeVisible();
    await expect(visibleText(page, /syyskuuta 2026/)).toBeVisible();
    const rows = page.locator("ol > li");
    await expect(rows).toHaveCount(10);
    await expect(rows.nth(0)).toContainText("09.00");
    await expect(rows.nth(0)).toContainText("Laji 1");
    await expect(rows.nth(1)).toContainText("Live");
    await expect(page.getByLabel("Sivu 1/2")).toBeVisible();

    await page.clock.runFor(10_000);
    await expect(page.getByLabel("Sivu 2/2")).toBeVisible();
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("Laji 11");
  });
});

// Lista hides the open series; the ticker drops its callout with it.
test.describe("attempt details", () => {
  test("Lista collapses the series after 15 seconds and reopens it on a non-best attempt", async ({
    page,
  }) => {
    const idle = () => [jumper(1, "Idle", "Jumper", "7,10", ["7,10", ""])];
    const server = await serve(page, idle());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/overlay/1-10?heat=1&style=broadcast-trail-plain");
    const details = page.locator("[data-attempt-details]:visible");
    await expect.poll(() => details.count()).toBe(1);
    await page.clock.runFor(14_000);
    await expect(details).toHaveCount(1);
    await page.clock.runFor(1001);
    await expect(details).toHaveCount(0);
    // The mark stays on the bar once the series is gone.
    await expect(visibleText(page, "7,10m")).toBeVisible();
    // An identical poll keeps it closed.
    await page.clock.runFor(15_000);
    await expect(details).toHaveCount(0);

    server.set([jumper(1, "Idle", "Jumper", "7,10", ["7,10", "x"])]);
    await page.clock.runFor(30_000);
    await expect(details).toHaveCount(1);
    await expect(details.locator("li").nth(1)).toContainText("x");
    await page.clock.runFor(15_001);
    await expect(details).toHaveCount(0);
  });

  test("Tikkeri still calls out a new attempt after the details have collapsed", async ({
    page,
  }) => {
    const server = await serve(page, field());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/overlay/1-10?heat=1&style=ticker");
    await expect(visibleText(page, "Korhonen")).toBeVisible();
    // Fifteen quiet seconds, then a poll that changes nothing.
    await page.clock.runFor(30_000);
    await expect(page.getByRole("status")).toHaveCount(0);

    server.set(virtanenJumps("x"));
    await page.clock.runFor(30_000);
    await expect(page.getByRole("status")).toContainText("Yritys 3");
  });
});
