import { expect, test } from "@playwright/test";

const runners = [
  { Id: 1, Name: "Slow Runner", Result: "12,50", HeatRank: 2 },
  { Id: 2, Name: "Fast Runner", Result: "10,20", HeatRank: 1 },
].map((runner) => ({
  ...runner,
  Attempts: null,
  Organization: { Name: "Club" },
}));
const rounds = ["Qualify", "Final"].map((category, i) => ({
  Index: i + 1,
  Name: category === "Qualify" ? "Alkuerät" : "Loppukilpailu",
  RoundTypeCategory: category,
  Heats: [{ Index: 1, Allocations: runners }],
  TotalResults: runners,
}));
const events = {
  "09.09.2026": rounds.map((round, i) => ({
    Id: i + 1,
    EventId: 10,
    EventName: "100 m",
    Name: round.Name,
    Category: "Track",
    Status: "Progress",
    BeginDateTimeWithTZ: `2026-09-09T1${i}:00:00+03:00`,
  })),
};

test.beforeEach(async ({ page }) => {
  await page.route(
    "https://cached-public-api.tuloslista.com/live/v1/**",
    async (route) => {
      const path = new URL(route.request().url()).pathname;
      const data = path.endsWith("/properties")
        ? { Competition: { Name: "Test Games" } }
        : path.includes("/results/")
          ? {
              Name: "100 m",
              EventCategory: "Track",
              Enrollments: [],
              Rounds: rounds,
            }
          : path.endsWith("/competition")
            ? [{ Id: 1, Name: "Test Games", Date: "2026-09-09" }]
            : events;
      await route.fulfill({ json: data });
    },
  );
});

test("search supports keyboard selection and preserves the chosen round", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByRole("combobox");
  await input.fill("Test Games");
  await expect(page.getByRole("option", { name: /Test Games/ })).toBeVisible();
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page.getByRole("option", { name: /Alkuerät/ })).toBeVisible();
  await input.fill("Test Games / 100");
  await input.press("ArrowDown");
  await input.press("ArrowUp");
  await input.press("Enter");
  await expect(page).toHaveURL(/competition\/1-10\?round=Qualify/);
  await expect(page.getByRole("heading", { name: "Test Games" })).toBeVisible();
});

test("round navigation, desktop results, and OBS clipboard link stay in sync", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/competition/1-10?round=Qualify");
  await page.getByRole("tab", { name: "Tulokset" }).click();
  await expect(
    page.getByRole("cell", { name: "10,20", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Loppukilpailu", exact: true })
    .click();
  await expect(page).toHaveURL(/round=Final/);
  await page.getByRole("button", { name: "OBS Overlay" }).click();
  await page.getByRole("button", { name: "Kopioi linkki" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("http://127.0.0.1:4173/obs/1-10?round=2&heat=1");
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(page).toHaveURL(/round=Qualify/);
  await page.getByRole("button", { name: "OBS Overlay" }).click();
  await expect(
    page.getByText("http://127.0.0.1:4173/obs/1-10?round=1&heat=1", {
      exact: true,
    }),
  ).toBeVisible();
});

test("event switcher can select another round of the same event", async ({
  page,
}) => {
  await page.goto("/competition/1-10?round=Final");
  await page.getByRole("button", { name: /100 m Loppukilpailu/ }).click();
  await page.getByRole("button", { name: /100 m Alkuerät/ }).click();
  await expect(page).toHaveURL(/round=Qualify/);
  await expect(
    page
      .locator("[data-popover-trigger]")
      .filter({ hasText: "100 m Alkuerät" }),
  ).toHaveAttribute("data-state", "closed");
  await expect(page.locator("button button")).toHaveCount(0);
});

test("OBS track results sort fastest first and the background is transparent", async ({
  page,
}) => {
  await page.goto("/obs/1-10?round=2&heat=1");
  await expect(page.getByRole("listitem").first()).toContainText("Fast Runner");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.getByText("Loppukilpailu", { exact: true })).toBeVisible();
  await page.goto("/obs/1-10?heat=99");
  await expect(page.getByText("Erä 99 ei ole olemassa")).toBeVisible();
  await page.goto("/obs/invalid");
  await expect(page.getByText("Virheellinen linkki")).toBeVisible();
});

test("mobile results and OBS drawer work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/competition/1-10?round=Final");
  await page.getByRole("tab", { name: "Tulokset" }).click();
  await expect(page.getByText("10,20", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "OBS Overlay" }).click();
  await expect(
    page.getByRole("button", { name: "Kopioi linkki" }),
  ).toBeVisible();
});

test("search API failure offers a retry", async ({ page }) => {
  await page.route("**/live/v1/competition", (route) =>
    route.fulfill({ status: 500, body: "unavailable" }),
  );
  await page.goto("/");
  await page.getByRole("combobox").fill("Test");
  await expect(page.getByRole("alert")).toContainText(
    "Tietojen lataaminen epäonnistui",
    { timeout: 15000 },
  );
  await page.unroute("**/live/v1/competition");
  await page.getByRole("button", { name: "Yritä uudelleen" }).click();
  await expect(page.getByRole("option", { name: /Test Games/ })).toBeVisible();
});

test("scheduled events start polling results when their status changes", async ({
  page,
}) => {
  let live = false;
  let resultRequests = 0;
  await page.route("**/live/v1/competition/1", (route) =>
    route.fulfill({
      json: {
        "09.09.2026": events["09.09.2026"].map((event) => ({
          ...event,
          Status: live ? "Progress" : "Allocated",
        })),
      },
    }),
  );
  await page.route("**/live/v1/results/1/10", (route) => {
    resultRequests++;
    return route.fulfill({
      json: {
        Name: "100 m",
        EventCategory: "Track",
        Enrollments: [],
        Rounds: rounds,
      },
    });
  });
  await page.clock.install();
  await page.goto("/competition/1-10");
  await expect(page.getByRole("heading", { name: "Test Games" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /100 m Loppukilpailu/ }),
  ).toBeVisible();
  await page.clock.runFor(2000);
  expect(resultRequests).toBe(1);
  live = true;
  await page.clock.runFor(30000);
  await expect(page.getByText("Käynnissä", { exact: true })).toBeVisible();
  await page.clock.runFor(2000);
  await expect.poll(() => resultRequests).toBeGreaterThan(1);
});

test("theme toggles without reacting to typing in search", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("combobox");
  await expect(input).toBeVisible();
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await input.fill("d");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
});

test("tab indicator follows pointer selection but keyboard navigation stays immediate", async ({
  page,
}) => {
  await page.goto("/competition/1-10");
  const results = page.getByRole("tab", { name: "Tulokset" });
  const indicator = page.locator(".motion-tab-indicator");
  await results.click();
  await expect(results).toHaveAttribute("aria-selected", "true");
  await expect(indicator).toHaveCSS("transition-duration", "0.18s");
  await expect
    .poll(async () => {
      const tab = await results.boundingBox();
      const highlight = await indicator.boundingBox();
      return Math.abs(tab!.x - highlight!.x);
    })
    .toBeLessThan(2);
  // Panel content is available immediately, without outgoing/incoming panel animations.
  await expect(
    page.getByRole("cell", { name: "10,20", exact: true }),
  ).toBeVisible();
  await results.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Pöytäkirjat" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(indicator).toHaveCSS("transition-duration", "0s");
  // Rapid reversal ends at the most recent selection.
  await results.click();
  await page.getByRole("tab", { name: "Ilmoittautuneet" }).click();
  await expect
    .poll(async () => {
      const tab = await page
        .getByRole("tab", { name: "Ilmoittautuneet" })
        .boundingBox();
      const highlight = await indicator.boundingBox();
      return Math.abs(tab!.x - highlight!.x);
    })
    .toBeLessThan(2);
});

test("reduced motion keeps tabs, popovers, copy feedback, and mobile drawers usable", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/competition/1-10");
  await page.getByRole("tab", { name: "Tulokset" }).click();
  await expect(page.locator(".motion-tab-indicator")).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.getByRole("button", { name: "OBS Overlay" }).click();
  await expect(page.locator("[data-slot=popover-content]")).toHaveCSS(
    "animation-duration",
    "0s",
  );
  await page.getByRole("button", { name: "Kopioi linkki" }).click();
  await expect(page.getByRole("button", { name: "Kopioitu!" })).toBeVisible();
  await expect(page.locator(".motion-copy-icon").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "OBS Overlay" }).click();
  await expect(page.locator("[data-slot=drawer-content]")).toBeVisible();
  await expect(page.locator("[data-slot=drawer-content]")).toHaveCSS(
    "animation-duration",
    "0s",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-slot=drawer-content]")).toHaveCount(0);
});

test("search options appear together with no stagger or focus zoom", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.getByRole("combobox");
  await input.fill("Test Games");
  await page.getByRole("option", { name: /Test Games/ }).click();
  await expect(page.getByRole("option")).toHaveCount(2);
  await expect(page.getByRole("option").last()).toBeVisible();
  const animations = await page
    .getByRole("listbox")
    .evaluate((list) => list.getAnimations({ subtree: true }).length);
  expect(animations).toBe(0);
  await expect(page.locator(".motion-search-surface")).toHaveCSS(
    "scale",
    "none",
  );
});
