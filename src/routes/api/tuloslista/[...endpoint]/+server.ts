import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

const API_URL = "https://live.tuloslista.com/api/v1";
const endpointPattern =
  /^(?:competition(?:\/\d+(?:\/properties)?)?|results\/\d+\/\d+)$/;
const cacheRequestHeaders = [
  "if-none-match",
  "if-modified-since",
  "cache-control",
  "pragma",
];
const responseHeaders = [
  "content-type",
  "cache-control",
  "etag",
  "last-modified",
  "expires",
  "date",
  "age",
];

export const GET: RequestHandler = async ({ params, request }) => {
  if (!endpointPattern.test(params.endpoint)) {
    return new Response(null, { status: 404 });
  }

  const headers = new Headers();
  const key = env.TULOSLISTA_API_KEY?.trim();
  if (key) headers.set("X-Tuloslista-Live-Auth", key);
  for (const name of cacheRequestHeaders) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/${params.endpoint}`, {
      headers,
      redirect: "error",
      signal: request.signal,
    });
  } catch {
    return new Response(null, { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 304) {
    await upstream.body?.cancel();
    return new Response(null, {
      status: upstream.status,
      headers: { "cache-control": "no-store" },
    });
  }

  const forwardedHeaders = new Headers();
  for (const name of responseHeaders) {
    const value = upstream.headers.get(name);
    if (value !== null) forwardedHeaders.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: forwardedHeaders,
  });
};
