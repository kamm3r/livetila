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
  await page.route("https://live.tuloslista.com/api/v1/**", async (route) => {
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
  });
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

test("round navigation, desktop results, and overlay clipboard link stay in sync", async ({
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
  await page.getByRole("button", { name: "Lähetysgrafiikka" }).click();
  await page.getByRole("button", { name: "Kopioi linkki" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(
      "http://127.0.0.1:4173/overlay/1-10?round=2&style=broadcast-trail-plain",
    );
  await page.keyboard.press("Escape");
  await page.goBack();
  await expect(page).toHaveURL(/round=Qualify/);
  await page.getByRole("button", { name: "Lähetysgrafiikka" }).click();
  const overlay = page.getByRole("link", { name: "Avaa grafiikka" });
  await expect(overlay).toHaveAttribute(
    "href",
    "http://127.0.0.1:4173/overlay/1-10?round=1&style=broadcast-trail-plain",
  );
  await page.getByText("Näytä erot").click();
  await expect(
    page.getByRole("switch", { name: "Näytä erot" }),
  ).not.toBeChecked();
  await expect(overlay).toHaveAttribute(
    "href",
    "http://127.0.0.1:4173/overlay/1-10?round=1&style=broadcast-trail-plain&gap=0",
  );
  await page.getByText("Tikkeri").click();
  await expect(page.getByRole("switch", { name: "Näytä erot" })).toHaveCount(0);
  await expect(overlay).toHaveAttribute(
    "href",
    "http://127.0.0.1:4173/overlay/1-10?round=1&style=ticker",
  );
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

test("overlay track results sort fastest first and the background is transparent", async ({
  page,
}) => {
  await page.goto("/overlay/1-10?round=2&heat=1");
  await expect(page.getByRole("listitem").first()).toContainText("Fast Runner");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await expect(page.getByText(/^Loppukilpailu – /)).toBeVisible();
  await page.goto("/overlay/1-10?heat=99");
  await expect(page.getByText("Erä 99 ei ole olemassa")).toBeVisible();
  await page.goto("/overlay/invalid");
  await expect(page.getByText("Virheellinen linkki")).toBeVisible();
});

test("mobile results and overlay drawer work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/competition/1-10?round=Final");
  await page.getByRole("tab", { name: "Tulokset" }).click();
  await expect(page.getByText("10,20", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Lähetysgrafiikka" }).click();
  await expect(
    page.getByRole("button", { name: "Kopioi linkki" }),
  ).toBeVisible();
});

test("search API failure offers a retry", async ({ page }) => {
  await page.route("**/api/v1/competition", (route) =>
    route.fulfill({ status: 500, body: "unavailable" }),
  );
  await page.goto("/");
  await page.getByRole("combobox").fill("Test");
  await expect(page.getByRole("alert")).toContainText(
    "Tietojen lataaminen epäonnistui",
    { timeout: 15000 },
  );
  await page.unroute("**/api/v1/competition");
  await page.getByRole("button", { name: "Yritä uudelleen" }).click();
  await expect(page.getByRole("option", { name: /Test Games/ })).toBeVisible();
});

test("results respect the 30-second interval before live status arrives", async ({
  page,
}) => {
  let live = false;
  let resultRequests = 0;
  await page.route("**/api/v1/competition/1", (route) =>
    route.fulfill({
      json: {
        "09.09.2026": events["09.09.2026"].map((event) => ({
          ...event,
          Status: live ? "Progress" : "Allocated",
        })),
      },
    }),
  );
  await page.route("**/api/v1/results/1/10", (route) => {
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
  await page.clock.runFor(29_000);
  expect(resultRequests).toBe(1);
  await page.clock.runFor(1000);
  await expect.poll(() => resultRequests).toBe(2);
  live = true;
  await page.clock.runFor(30_000);
  await expect(page.getByText("LIVE", { exact: true })).toBeVisible();
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
  await page.getByRole("button", { name: "Lähetysgrafiikka" }).click();
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
  await page.getByRole("button", { name: "Lähetysgrafiikka" }).click();
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
  await page.route("**/api/v1/competition", (route) =>
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
  await page.route("**/api/v1/competition/1", (route) =>
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
  const trigger = page.getByRole("button", { name: "Lähetysgrafiikka" });
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

test("drawer drag stays direct, settles at 280ms, and keyboard overrides inline transitions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/competition/1-10?round=Qualify");
  await page
    .getByRole("button", { name: "Lähetysgrafiikka", exact: true })
    .click();
  const drawer = page.locator('[data-slot="drawer-content"]');
  await expect(drawer).toBeVisible();
  await expect
    .poll(() =>
      drawer.evaluate(
        (el) =>
          el.getAnimations().filter((a) => a.playState === "running").length,
      ),
    )
    .toBe(0);
  const box = (await drawer.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 16);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 55, { steps: 10 });
  await expect(drawer).toHaveClass(/vaul-dragging/);
  expect(
    await drawer.evaluate((el) => getComputedStyle(el).transitionProperty),
  ).toBe("none");
  await page.waitForTimeout(250); // Release slowly enough to settle, rather than dismiss.
  await page.mouse.up();
  await expect(drawer).toBeVisible();
  expect(
    await drawer.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0.28s");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await drawer.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.keyboard.press("Tab");
  expect(
    await drawer.evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await page.keyboard.press("Escape");
  await expect(drawer).toHaveCount(0);
});

for (const path of ["/competition/1-10", "/overlay/1-10"]) {
  test(`new results appear on the next 30-second refresh: ${path}`, async ({
    page,
  }) => {
    let result = "10,20";
    await page.route("**/api/v1/results/1/10", (route) =>
      route.fulfill({
        json: {
          Name: "100 m",
          EventCategory: "Track",
          Enrollments: [],
          Rounds: rounds.map((round) => ({
            ...round,
            TotalResults: [{ ...runners[1], Result: result }],
            Heats: [
              { Index: 1, Allocations: [{ ...runners[1], Result: result }] },
            ],
          })),
        },
      }),
    );
    await page.clock.install();
    await page.goto(path);
    if (path.startsWith("/competition/")) {
      await page.getByRole("tab", { name: "Tulokset" }).click();
    }
    await expect(
      page
        .getByText("10,20", { exact: true })
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    result = "09,99";
    await page.clock.runFor(30_000);
    await expect(
      page
        .getByText("09,99", { exact: true })
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
  });
}

for (const path of ["/competition/1-10", "/overlay/1-10"]) {
  test(`refresh visibility policy: ${path}`, async ({ page }) => {
    let requests = 0;
    page.on("request", (request) => {
      if (request.url().endsWith("/results/1/10")) requests++;
    });
    await page.clock.install();
    await page.goto(path);
    await expect(
      page.getByText("Test Games", { exact: true }).first(),
    ).toBeVisible();
    await expect.poll(() => requests).toBe(1);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        value: "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.clock.runFor(30_100);
    if (path.startsWith("/overlay/")) {
      await expect.poll(() => requests).toBeGreaterThan(1);
    } else {
      expect(requests).toBe(1);
      await page.evaluate(() => {
        Object.defineProperty(document, "visibilityState", {
          configurable: true,
          value: "visible",
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      // Foreground polling resumes on the next scheduled refresh.
      await page.clock.runFor(30_000);
      await expect.poll(() => requests).toBeGreaterThan(1);
    }
  });
}

test("malformed competition and overlay links never fetch competition data", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/")) requests.push(request.url());
  });
  await page.clock.install();
  for (const path of ["/competition/1-10-extra", "/overlay/a-b"]) {
    await page.goto(path);
    await expect(
      page.getByText("Virheellinen linkki", { exact: true }),
    ).toBeVisible();
    await page.clock.runFor(2000);
  }
  expect(requests).toEqual([]);
});

test("search remains usable with unavailable history storage and competition names containing slashes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === "livetila:recent-searches")
        throw new Error("Storage disabled");
      return getItem.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === "livetila:recent-searches")
        throw new Error("Storage disabled");
      return setItem.call(this, key, value);
    };
  });
  await page.route("**/api/v1/competition", (route) =>
    route.fulfill({
      json: [{ Id: 1, Name: "Test / Games", Date: "2026-09-09" }],
    }),
  );
  await page.goto("/");
  const input = page.getByRole("combobox");
  await input.fill("Test");
  await page.getByRole("option", { name: /Test \/ Games/ }).click();
  await input.fill("Test / Games / 100");
  await expect(page.getByRole("option")).toHaveCount(2);
  await input.fill("Test / Games");
  await expect(input).toHaveValue("");
  await page.getByRole("option", { name: /Test \/ Games/ }).click();
  await page.getByRole("option", { name: /Alkuerät/ }).click();
  await expect(page).toHaveURL(/competition\/1-10\?round=Qualify/);
});

for (const path of ["/competition/1-10", "/overlay/1-10"]) {
  test(`refresh failure preserves loaded results and recovers: ${path}`, async ({
    page,
  }) => {
    let fail = false;
    let result = "10,20";
    let failures = 0;
    await page.route("**/api/v1/results/1/10", (route) => {
      if (fail) {
        failures++;
        return route.fulfill({ status: 503, body: "Unavailable" });
      }
      return route.fulfill({
        json: {
          Name: "100 m",
          EventCategory: "Track",
          Enrollments: [],
          Rounds: rounds.map((round) => ({
            ...round,
            TotalResults: [{ ...runners[1], Result: result }],
            Heats: [
              { Index: 1, Allocations: [{ ...runners[1], Result: result }] },
            ],
          })),
        },
      });
    });
    await page.clock.install();
    await page.goto(path);
    if (path.startsWith("/competition/"))
      await page.getByRole("tab", { name: "Tulokset" }).click();
    const score = (value: string) =>
      page.getByText(value, { exact: true }).filter({ visible: true }).first();
    await expect(score("10,20")).toBeVisible();
    const delayNotice = page.getByText("Päivitys viivästyy", { exact: true });
    fail = true;
    for (let attempt = 1; attempt <= 4; attempt++) {
      await page.clock.runFor(attempt === 1 ? 30_000 : 4000);
      await expect.poll(() => failures).toBeGreaterThanOrEqual(attempt);
      // A failed scheduled refresh is already 30 seconds past the last data.
    }
    await expect(delayNotice).toBeVisible();
    await expect(score("10,20")).toBeVisible();
    if (path.startsWith("/competition/"))
      await expect(page.getByRole("tab", { name: "Tulokset" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    fail = false;
    result = "09,99";
    await page.clock.runFor(30_000);
    await expect(score("09,99")).toBeVisible();
    await expect(delayNotice).toHaveCount(0);
  });
}

for (const heatCount of [0, 1]) {
  test(`overall results remain visible with ${heatCount} empty heats`, async ({
    page,
  }) => {
    await page.route("**/api/v1/results/**", (route) =>
      route.fulfill({
        json: {
          Name: "100 m",
          EventCategory: "Track",
          Enrollments: [],
          Rounds: [
            {
              ...rounds[1],
              Heats: Array.from({ length: heatCount }, (_, i) => ({
                Index: i + 1,
                Allocations: [],
              })),
              TotalResults: runners,
            },
          ],
        },
      }),
    );
    await page.goto("/competition/1-10?round=Final");
    await page.getByRole("tab", { name: "Tulokset" }).click();
    await expect(
      page.getByRole("heading", { name: "Kokonaistulokset" }),
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "10,20", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Tuloksia ei ole saatavilla vielä..."),
    ).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByText("10,20", { exact: true }).last()).toBeVisible();
  });
}

for (const path of [
  "/competition/1-10?round=Final",
  "/overlay/1-10?heat=1",
  "/overlay/1-10",
]) {
  test(`official ranks resolve tied field results: ${path}`, async ({
    page,
  }) => {
    const athletes = [
      {
        ...runners[0],
        Name: "Heat Second",
        Result: "6,50",
        HeatRank: 2,
        ResultRank: 1,
      },
      {
        ...runners[1],
        Name: "Heat Winner",
        Result: "6,50",
        HeatRank: 1,
        ResultRank: 2,
      },
    ];
    await page.route("**/api/v1/results/**", (route) =>
      route.fulfill({
        json: {
          Name: "Long jump",
          EventCategory: "Field",
          Enrollments: [],
          Rounds: [
            {
              ...rounds[1],
              Heats: [{ Index: 1, Allocations: athletes }],
              TotalResults: athletes,
            },
          ],
        },
      }),
    );
    await page.goto(path);
    if (path.startsWith("/competition")) {
      await page.getByRole("tab", { name: "Tulokset" }).click();
      await expect(
        page
          .getByRole("tabpanel", { name: "Tulokset" })
          .locator("tbody tr")
          .first(),
      ).toContainText("Heat Winner");
    } else {
      await expect(page.getByRole("listitem").first()).toContainText(
        path.includes("heat=") ? "Heat Winner" : "Heat Second",
      );
    }
  });
}

for (const path of ["/competition/1-10?round=Final", "/overlay/1-10?heat=1"]) {
  test(`athlete club logos and foreign flags render and survive refresh: ${path}`, async ({
    page,
  }) => {
    const athletes = runners.map((runner, i) => ({
      ...runner,
      Organization: { Name: "Nakkilan Vire", NameShort: "NakkVire", Id: 51 },
      Athletes: [{ Nationality: i === 0 ? "FIN" : "SWE" }],
    }));
    await page.route("https://www.tilastopaja.info/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20"><rect width="24" height="20" fill="blue"/></svg>',
      }),
    );
    await page.route("https://flagcdn.com/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20"><rect width="24" height="20" fill="yellow"/></svg>',
      }),
    );
    await page.route("**/api/v1/results/**", (route) =>
      route.fulfill({
        json: {
          Name: "100 m",
          EventCategory: "Track",
          Enrollments: athletes,
          Rounds: [
            {
              ...rounds[1],
              Heats: [{ Index: 1, Allocations: athletes }],
              TotalResults: athletes,
            },
          ],
        },
      }),
    );
    await page.clock.install();
    await page.goto(path);
    if (path.startsWith("/competition")) {
      for (const tab of ["Ilmoittautuneet", "Pöytäkirjat", "Tulokset"]) {
        await page.getByRole("tab", { name: tab }).click();
        const panel = page.getByRole("tabpanel", { name: tab });
        await expect(
          panel.locator('img[src*="NakkVire.png"]').first(),
        ).toBeVisible();
        await expect(
          panel.getByRole("img", { name: "Ruotsi" }).first(),
        ).toBeVisible();
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(
        page
          .getByRole("tabpanel", { name: "Tulokset" })
          .getByRole("img", { name: "Ruotsi" })
          .last(),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole("img", { name: "Nakkilan Vire" }),
      ).toBeVisible();
      await expect(page.getByRole("img", { name: "Ruotsi" })).toBeVisible();
    }
    const logo = page.locator('img[src*="NakkVire.png"]:visible');
    await logo.dispatchEvent("error");
    await expect(logo).toHaveCount(0);
    await expect(
      page.getByText("Slow Runner", { exact: true }).last(),
    ).toBeVisible();
    await Promise.all([
      page.waitForResponse("**/api/v1/results/**"),
      page.clock.runFor(30_000),
    ]);
    await expect(page.locator('img[src*="NakkVire.png"]:visible')).toHaveCount(
      0,
    );
    await expect(
      page.getByText("Slow Runner", { exact: true }).last(),
    ).toBeVisible();
  });
}

test("confirmation checkmarks stay visible while status labels are screen-reader-only", async ({
  page,
}) => {
  await page.route("**/api/v1/results/**", (route) =>
    route.fulfill({
      json: {
        Name: "100 m",
        EventCategory: "Track",
        Rounds: rounds,
        Enrollments: [
          { ...runners[0], Confirmed: true },
          { ...runners[1], Confirmed: false },
        ],
      },
    }),
  );
  await page.goto("/competition/1-10?round=Final&tab=participants");
  await expect(
    page.getByRole("tab", { name: "Ilmoittautuneet (1/2 vahvistanut)" }),
  ).toBeVisible();
  const table = page
    .getByRole("tabpanel", { name: "Ilmoittautuneet" })
    .getByRole("table");
  await expect(table.locator("tbody tr").first().locator("svg")).toBeVisible();
  await expect(table.getByText("Vahvistettu", { exact: true })).toHaveClass(
    "sr-only",
  );
  await expect(table.getByText("Ei vahvistettu", { exact: true })).toHaveClass(
    "sr-only",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const participants = page.getByRole("tabpanel", { name: "Ilmoittautuneet" });
  await expect(
    participants.getByRole("listitem").first().locator("svg"),
  ).toBeVisible();
});

for (const [status, tab] of [
  ["Unallocated", "Ilmoittautuneet"],
  ["Allocated", "Pöytäkirjat"],
  ["Progress", "Tulokset"],
  ["Official", "Tulokset"],
] as const) {
  test(`competition opens on the tab matching event status: ${status}`, async ({
    page,
  }) => {
    await page.route("**/api/v1/competition/1", (route) =>
      route.fulfill({
        json: {
          "09.09.2026": events["09.09.2026"].map((event) => ({
            ...event,
            Status: status,
          })),
        },
      }),
    );
    await page.goto("/competition/1-10?round=Final");
    await expect(page.getByRole("tab", { name: tab })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
}

test("chosen tab is kept in the URL across reloads and round changes", async ({
  page,
}) => {
  await page.goto("/competition/1-10?round=Qualify");
  await page.getByRole("tab", { name: "Pöytäkirjat" }).click();
  await expect(page).toHaveURL(/tab=protocol/);
  await page.reload();
  await expect(page.getByRole("tab", { name: "Pöytäkirjat" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.getByRole("button", { name: "Loppukilpailu" }).click();
  await expect(page).toHaveURL(
    /round=Final.*tab=protocol|tab=protocol.*round=Final/,
  );
  await expect(page.getByRole("tab", { name: "Pöytäkirjat" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("field results show aligned attempts, records, gaps and live changes", async ({
  page,
}) => {
  const jumper = (
    id: number,
    name: string,
    marks: string[],
    result: string,
    rank: number,
  ) => ({
    ...runners[0],
    Id: id,
    Name: name,
    Position: id,
    Result: result,
    HeatRank: rank,
    ResultRank: rank,
    PB: id === 2 ? "7,50" : "",
    Attempts: marks.map((Line1) => ({ Line1, Line2: "" })),
  });
  let athletes = [
    jumper(1, "First Jumper", ["7,10", "7,40"], "7,40", 1),
    jumper(2, "Second Jumper", ["7,20", "x"], "7,20", 2),
  ];
  await page.route("**/api/v1/results/**", (route) =>
    route.fulfill({
      json: {
        Name: "Long jump",
        EventCategory: "Field",
        Enrollments: [],
        Rounds: [
          {
            ...rounds[1],
            Heats: [{ Index: 1, Allocations: athletes }],
            TotalResults: athletes,
          },
        ],
      },
    }),
  );
  await page.clock.install();
  await page.goto("/competition/1-10?round=Final");
  const panel = page.getByRole("tabpanel", { name: "Tulokset" });
  const table = panel.getByRole("table");
  const latest = panel.getByRole("status");
  await expect(table.getByRole("columnheader")).toHaveText([
    "Sija",
    "Seuran logo",
    "Urheilija",
    "Seura",
    "1",
    /2\s*\(meneillään\)/,
    "3",
    "4",
    "5",
    "6",
    "Tulos",
    "Ero",
  ]);
  const first = table.locator("tbody tr").first();
  const second = table.locator("tbody tr").nth(1);
  await expect(first.locator("td").nth(-2)).toHaveText("7,40");
  await expect(first.locator("td").last()).toHaveText("—");
  await expect(second.locator("td").last()).toHaveText("−0,20");
  await expect(first).not.toHaveAttribute("data-changed");
  // Round 2 is complete, so the first athlete in order starts round 3.
  await expect(latest).toContainText("Second Jumper");
  await expect(latest).toContainText("Seuraavana");
  await expect(latest).toContainText("First Jumper");

  athletes = [
    jumper(1, "First Jumper", ["7,10", "7,40", "x"], "7,40", 1),
    jumper(2, "Second Jumper", ["7,20", "x"], "7,20", 2),
  ];
  await page.clock.runFor(30_000);
  await expect(latest).toContainText(/Viimeisin.*First Jumper.*x/);
  await expect(latest).toContainText(/Seuraavana.*Second Jumper/);

  athletes = [
    jumper(2, "Second Jumper", ["7,20", "x", "7,55"], "7,55", 1),
    jumper(1, "First Jumper", ["7,10", "7,40", "x"], "7,40", 2),
  ];
  await page.clock.runFor(30_000);
  await expect(table.getByRole("columnheader")).toHaveCount(12);
  await expect(first).toContainText("Second Jumper");
  await expect(first).toHaveAttribute("data-changed");
  await expect(first).toContainText("Noussut 1 sijaa");
  await expect(first.locator("td").nth(-2)).toHaveText(/^7,55\s*PB\s*Ennätys$/);
  await expect(second.locator("td").last()).toHaveText("−0,15");
  await expect(latest).toContainText("▲ sijalle 1");
  // After the third round the order may change, so no next athlete is shown.
  await expect(latest).not.toContainText("Seuraavana");
  await page.clock.runFor(5000);
  await expect(first).not.toHaveAttribute("data-changed");
});

test("latest attempt bar is hidden when the event is not live", async ({
  page,
}) => {
  const athletes = [1, 2].map((id) => ({
    ...runners[0],
    Id: id,
    Name: `Jumper ${id}`,
    Position: id,
    Result: "7,00",
    HeatRank: id,
    ResultRank: id,
    Attempts: [{ Line1: "7,00", Line2: "" }],
  }));
  await page.route("**/api/v1/competition/1", (route) =>
    route.fulfill({
      json: {
        "09.09.2026": events["09.09.2026"].map((event) => ({
          ...event,
          Category: "Field",
          Status: "Official",
        })),
      },
    }),
  );
  await page.route("**/api/v1/results/**", (route) =>
    route.fulfill({
      json: {
        Name: "Long jump",
        EventCategory: "Field",
        Enrollments: [],
        Rounds: [
          {
            ...rounds[1],
            Heats: [{ Index: 1, Allocations: athletes }],
            TotalResults: athletes,
          },
        ],
      },
    }),
  );
  await page.goto("/competition/1-10?round=Final");
  const panel = page.getByRole("tabpanel", { name: "Tulokset" });
  await expect(panel.getByRole("table")).toContainText("Jumper 1");
  await expect(panel.getByText("Viimeisin suoritus")).toHaveCount(0);
  await expect(panel.getByText("Seuraavana")).toHaveCount(0);
});

test("track results show gaps for hand and long times without attempt columns", async ({
  page,
}) => {
  const athletes = [
    ["2.57,38", "Leader"],
    ["3.12,6h", "Hand timed"],
    ["3.58,79", "Minute behind"],
  ].map(([Result, Name], i) => ({
    ...runners[0],
    Id: i + 1,
    Name,
    Result,
    HeatRank: i + 1,
    Attempts: [{ Line1: Result, Line2: null }],
  }));
  await page.route("**/api/v1/results/**", (route) =>
    route.fulfill({
      json: {
        Name: "1000 m",
        EventCategory: "Track",
        Enrollments: [],
        Rounds: [
          {
            ...rounds[1],
            Heats: [{ Index: 1, Allocations: athletes }],
            TotalResults: athletes,
          },
        ],
      },
    }),
  );
  await page.goto("/competition/1-10?round=Final");
  const table = page
    .getByRole("tabpanel", { name: "Tulokset" })
    .getByRole("table");
  await expect(table.getByRole("columnheader")).toHaveText([
    "Sija",
    "Seuran logo",
    "Urheilija",
    "Seura",
    "Tulos",
    "Ero",
  ]);
  const gaps = table.locator("tbody tr td:last-child");
  await expect(gaps).toHaveText(["—", "+15,22", "+1.01,41"]);
});

test("cross-country results are timed and show gaps to the leader", async ({
  page,
}) => {
  const athletes = [
    ["12.46,9h", "Second"],
    ["12.37,7h", "Winner"],
  ].map(([Result, Name], i) => ({
    ...runners[0],
    Id: i + 1,
    Name,
    Result,
    HeatRank: 0,
    Attempts: [{ Line1: Result, Line2: null }],
  }));
  await page.route("**/api/v1/results/**", (route) =>
    route.fulfill({
      json: {
        Name: "Maastojuoksu",
        EventCategory: "Street",
        Enrollments: [],
        Rounds: [
          {
            ...rounds[1],
            Heats: [{ Index: 1, Allocations: athletes }],
            TotalResults: athletes,
          },
        ],
      },
    }),
  );
  await page.goto("/competition/1-10?round=Final");
  const rows = page
    .getByRole("tabpanel", { name: "Tulokset" })
    .getByRole("table")
    .locator("tbody tr");
  await expect(rows.locator("td:nth-child(3)")).toHaveText([
    /Winner/,
    /Second/,
  ]);
  await expect(rows.locator("td:last-child")).toHaveText(["—", "+9,20"]);
});

test("vertical results align attempts by height without six-slot padding or gap centimetre marks", async ({
  page,
}) => {
  const athletes = [
    ["130", "Lower"],
    ["135", "Higher"],
  ].map(([Result, Name], i) => ({
    ...runners[0],
    Id: i + 1,
    Name,
    Result,
    HeatRank: 0,
    Attempts: [{ Line1: Result, Line2: "o" }],
  }));
  await page.route("**/api/v1/results/**", (route) =>
    route.fulfill({
      json: {
        Name: "Korkeus",
        EventCategory: "Field",
        Enrollments: [],
        Rounds: [
          {
            ...rounds[1],
            Heats: [{ Index: 1, Allocations: athletes }],
            TotalResults: athletes,
          },
        ],
      },
    }),
  );
  await page.goto("/competition/1-10?round=Final");
  const table = page
    .getByRole("tabpanel", { name: "Tulokset" })
    .getByRole("table");
  await expect(table.getByRole("columnheader")).toHaveText([
    "Sija",
    "Seuran logo",
    "Urheilija",
    "Seura",
    "130",
    "135",
    "Tulos",
    "Ero",
  ]);
  await expect(table.locator("tbody tr td:last-child")).toHaveText(["—", "−5"]);
});

test("protocol lists every heat in one table with heat rows", async ({
  page,
}) => {
  const heat = (index: number, names: string[]) => ({
    Index: index,
    Allocations: names.map((Name, i) => ({
      ...runners[0],
      Id: index * 10 + i,
      Name,
      Position: names.length - i,
      Result: "",
    })),
  });
  await page.route("**/api/v1/results/**", (route) =>
    route.fulfill({
      json: {
        Name: "100 m",
        EventCategory: "Track",
        Enrollments: [],
        Rounds: [
          {
            ...rounds[1],
            Heats: [heat(1, ["Second", "First"]), heat(2, ["Only"])],
            TotalResults: [],
          },
        ],
      },
    }),
  );
  await page.goto("/competition/1-10?round=Final&tab=protocol");
  const table = page
    .getByRole("tabpanel", { name: "Pöytäkirjat" })
    .getByRole("table");
  await expect(table.getByRole("columnheader").first()).toHaveText("Rata");
  await expect(table.locator("tbody th")).toHaveText([
    /Erä 1\s*· 2 urheilijaa/,
    /Erä 2\s*· 1 urheilijaa/,
  ]);
  // Lanes are listed in order within each heat.
  await expect(table.locator("tbody td:nth-child(3)")).toHaveText([
    /First/,
    /Second/,
    /Only/,
  ]);
});

test("athletes eliminated after three rounds get hatched attempt slots", async ({
  page,
}) => {
  const athletes = Array.from({ length: 9 }, (_, i) => {
    const mark = (700 - i * 10).toString().replace(/(\d)(\d\d)$/, "$1,$2");
    const count = i < 8 ? 4 : 3;
    return {
      ...runners[0],
      Id: i + 1,
      Name: `Jumper ${i + 1}`,
      Position: i + 1,
      Result: mark,
      HeatRank: i + 1,
      ResultRank: i + 1,
      Attempts: Array.from({ length: count }, (_, j) => ({
        Line1: j === 0 ? mark : "x",
        Line2: "",
      })),
    };
  });
  await page.route("**/api/v1/competition/1", (route) =>
    route.fulfill({
      json: {
        "09.09.2026": events["09.09.2026"].map((event) => ({
          ...event,
          Category: "Field",
        })),
      },
    }),
  );
  await page.route("**/api/v1/results/**", (route) =>
    route.fulfill({
      json: {
        Name: "Long jump",
        EventCategory: "Field",
        Enrollments: [],
        Rounds: [
          {
            ...rounds[1],
            Heats: [{ Index: 1, Allocations: athletes }],
            TotalResults: athletes,
          },
        ],
      },
    }),
  );
  await page.goto("/competition/1-10?round=Final&tab=results");
  const table = page
    .getByRole("tabpanel", { name: "Tulokset" })
    .getByRole("table");
  await expect(table.locator("tbody tr").first()).toContainText("Jumper 1");
  await expect(table.locator("td.hatch")).toHaveCount(3);
  await expect(
    table.locator("tbody tr").last().locator("td.hatch"),
  ).toHaveCount(3);
  // The live round in progress is marked in its column header.
  await expect(
    table.getByRole("columnheader", { name: "4 (meneillään)" }),
  ).toBeVisible();
});

for (const variant of [
  "desktop",
  "mobile",
  "broadcast-trail-plain",
  "ticker",
]) {
  test(`active athlete dots follow upstream selection and stop for official results: ${variant}`, async ({
    page,
  }) => {
    let active = 101;
    let status = "Progress";
    const athletes = runners.map((runner, index) => ({
      ...runner,
      AllocId: 101 + index,
      TeamId: 201 + index,
    }));
    await page.route("**/api/v1/results/**", (route) =>
      route.fulfill({
        json: {
          Name: "Long jump",
          EventCategory: "Field",
          Enrollments: athletes.map((entry) => ({
            ...entry,
            Id: entry.Id + 1000,
            Confirmed: true,
          })),
          Rounds: [
            {
              ...rounds[1],
              Status: status,
              TotalResults: athletes,
              Heats: [
                {
                  Index: 1,
                  ActiveAllocationId: active,
                  ActiveAllocationAttemptIndex: 0,
                  Allocations: athletes,
                },
              ],
            },
          ],
        },
      }),
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (variant === "mobile")
      await page.setViewportSize({ width: 390, height: 844 });
    await page.clock.install();
    const competition = variant === "desktop" || variant === "mobile";
    await page.goto(
      competition
        ? "/competition/1-10?round=Final"
        : `/overlay/1-10?heat=1&style=${variant}`,
    );
    const indicator = page.locator("[data-active-attempt]:visible");
    await expect(indicator).toHaveCount(1);
    const row = (name: string) =>
      page
        .locator("tr, li")
        .filter({ hasText: name })
        .locator("[data-active-attempt]:visible");
    await expect(row("Slow Runner")).toHaveCount(1);
    if (competition) {
      for (const tab of ["Pöytäkirjat", "Ilmoittautuneet"]) {
        await page.getByRole("tab", { name: tab }).click();
        await expect(indicator).toHaveCount(0);
      }
      await page.getByRole("tab", { name: "Tulokset" }).click();
      await expect(indicator).toHaveCount(1);
    }

    expect(
      await indicator
        .locator(".dot")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe("none");
    active = 102;
    await page.clock.runFor(30_000);
    await expect(row("Fast Runner")).toHaveCount(1);
    await expect(row("Slow Runner")).toHaveCount(0);
    if (competition) {
      for (const tab of ["Pöytäkirjat", "Ilmoittautuneet"]) {
        await page.getByRole("tab", { name: tab }).click();
        await expect(indicator).toHaveCount(0);
      }
      await page.getByRole("tab", { name: "Tulokset" }).click();
      await expect(indicator).toHaveCount(1);
    }

    active = 0;
    await page.clock.runFor(30_000);
    await expect(indicator).toHaveCount(0);
    active = 101;
    status = "Official";
    await page.clock.runFor(30_000);
    await expect(indicator).toHaveCount(0);
  });
}
