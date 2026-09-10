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

test("search reveals more competitions on scroll and resets after filtering", async ({
  page,
}) => {
  await page.route("**/live/v1/competition", (route) =>
    route.fulfill({
      json: Array.from({ length: 26 }, (_, i) => ({
        Id: i + 1,
        Name: `Games ${String(i + 1).padStart(2, "0")}`,
        Date: "2026-09-09",
      })),
    }),
  );
  await page.goto("/");
  const input = page.getByRole("combobox");
  await input.click();
  await expect(page.getByRole("option")).toHaveCount(10);
  await page.getByRole("listbox").evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(page.getByRole("option")).toHaveCount(20);
  // The explicit control also works with keyboard focus without closing the panel.
  await page.getByRole("button", { name: "Näytä lisää" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option")).toHaveCount(26);
  await expect(page.getByRole("button", { name: "Näytä lisää" })).toHaveCount(
    0,
  );
  await input.fill("Games 26");
  await expect(page.getByRole("option")).toHaveCount(1);
  await expect(page.getByRole("option")).toContainText("Games 26");
  await input.fill("Games");
  await expect(page.getByRole("option")).toHaveCount(10);
  await expect
    .poll(() => page.getByRole("listbox").evaluate((el) => el.scrollTop))
    .toBe(0);
});

test("event search can reach events beyond the first batch", async ({
  page,
}) => {
  await page.route("**/live/v1/competition/1", (route) =>
    route.fulfill({
      json: {
        "09.09.2026": Array.from({ length: 32 }, (_, i) => ({
          ...events["09.09.2026"][0],
          Id: i + 1,
          EventId: i + 100,
          EventName: `Event ${String(i + 1).padStart(2, "0")}`,
        })),
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("combobox").fill("Test Games");
  await page.getByRole("option", { name: /Test Games/ }).click();
  await expect(page.getByRole("option")).toHaveCount(15);
  await page.getByRole("button", { name: "Näytä lisää" }).click();
  await expect(page.getByRole("option")).toHaveCount(30);
  await page.getByRole("button", { name: "Näytä lisää" }).click();
  await expect(page.getByRole("option")).toHaveCount(32);
  await page.getByRole("option", { name: /Event 32/ }).click();
  await expect(page).toHaveURL(/competition\/1-131\?round=Qualify/);
});

test("home suggestions open without shifting the page", async ({ page }) => {
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  const input = page.getByRole("combobox");
  const before = await heading.boundingBox();
  const inputBefore = await input.boundingBox();
  await input.click();
  await expect(page.getByRole("option", { name: /Test Games/ })).toBeVisible();
  expect((await heading.boundingBox())?.y).toBe(before?.y);
  expect((await input.boundingBox())?.y).toBe(inputBefore?.y);
  await input.press("Escape");
  await expect(page.getByRole("option")).toHaveCount(0);
  await input.press("ArrowDown");
  await expect(page.getByRole("option", { name: /Test Games/ })).toBeVisible();
  await page.getByRole("heading", { level: 1 }).click();
  await expect(page.getByRole("option")).toHaveCount(0);
  await input.click();
  await page.getByRole("option", { name: /Test Games/ }).click();
  await expect(input).toBeFocused();
  await expect(page.getByRole("option", { name: /Alkuerät/ })).toBeVisible();
  expect((await heading.boundingBox())?.y).toBe(before?.y);
});

test("recent searches persist, stay capped at four, and can be removed with keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "livetila:recent-searches",
      JSON.stringify(
        Array.from({ length: 4 }, (_, i) => ({
          id: `/competition/2-${i + 20}`,
          url: `/competition/2-${i + 20}`,
          label: `Previous ${i + 1}`,
        })),
      ),
    ),
  );
  await page.reload();
  await page.getByRole("combobox").fill("Test Games");
  await page.getByRole("option", { name: /Test Games/ }).click();
  await page.getByRole("option", { name: /Alkuerät/ }).click();
  await expect(page).toHaveURL(/round=Qualify/);
  await page.goto("/");
  await page.getByRole("combobox").click();
  await expect(
    page.getByRole("button", { name: /Poista viimeisimmistä/ }),
  ).toHaveCount(4);
  await expect(page.getByRole("option").first()).toContainText(
    "Test Games / 100 m / Alkuerät",
  );
  const remove = page.getByRole("button", {
    name: /Poista viimeisimmistä.*Test Games/,
  });
  await remove.focus();
  await remove.press("Enter");
  await expect(page.getByRole("combobox")).toBeFocused();
  await expect(
    page.getByRole("button", { name: /Poista viimeisimmistä/ }),
  ).toHaveCount(3);
  await page.reload();
  await page.getByRole("combobox").click();
  await expect(
    page.getByRole("button", { name: /Poista viimeisimmistä/ }),
  ).toHaveCount(3);
  await page.getByRole("option", { name: "Previous 1", exact: true }).click();
  await expect(page).toHaveURL(/competition\/2-20$/);
});

test("popover uses CSS transitions and keyboard opening remains immediate", async ({
  page,
}) => {
  await page.goto("/competition/1-10?round=Qualify");
  const trigger = page.getByRole("button", { name: "OBS Overlay" });
  await trigger.click();
  const popover = page.locator('[data-slot="popover-content"]');
  await expect(popover).toBeVisible();
  expect(
    await popover.evaluate((el) => ({
      property: getComputedStyle(el).transitionProperty,
      animation: getComputedStyle(el).animationName,
    })),
  ).toEqual({ property: "opacity, transform", animation: "none" });
  await page.keyboard.press("Escape");
  await expect(popover).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(popover).toBeVisible();
  expect(
    await popover.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
});
