import type { Page, Request } from "@playwright/test";

// Advances the frozen test clock until the page has fetched and received the
// next refresh it schedules. Each query starts a moment after the clock is
// installed, so its 30-second refresh lands just past the mark; stepping a
// fixed 30 seconds sometimes stopped short of it on slower machines.
export async function nextRefresh(page: Page, path = /\/api\/v1\/results\//) {
  // A refresh from the previous step may still be in flight; let it land so
  // its response is not taken for the next one.
  await new Promise((done) => setTimeout(done, 150));
  const sent = new Set<Request>();
  const onRequest = (request: Request) => {
    if (path.test(new URL(request.url()).pathname)) sent.add(request);
  };
  page.on("request", onRequest);
  let arrived = false;
  const response = page
    .waitForResponse((res) => sent.has(res.request()), { timeout: 60_000 })
    .then(() => {
      arrived = true;
    });
  try {
    for (let elapsed = 0; !arrived && elapsed < 45_000; elapsed += 500) {
      await page.clock.runFor(500);
      // Let a request that just left the page come back before stepping on.
      await Promise.race([
        response,
        new Promise((done) => setTimeout(done, 25)),
      ]);
    }
    await response;
  } finally {
    page.off("request", onRequest);
  }
}
