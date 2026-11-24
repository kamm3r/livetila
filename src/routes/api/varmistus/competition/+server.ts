import type { RequestHandler } from "./$types";

const CONFIRMATION_API_URL = "https://api.tuloslista.com/api/v1/competition";

export const GET: RequestHandler = async ({ request }) => {
  try {
    const upstream = await fetch(CONFIRMATION_API_URL, {
      signal: request.signal,
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
};
