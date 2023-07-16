import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const compId = searchParams.get('compId');
  const deez = searchParams.get('deez');
  const res = await fetch(
    `https://cached-public-api.tuloslista.com/live/v1/results/${compId}/${deez}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const product = await res.json();

  return NextResponse.json({ product });
}
