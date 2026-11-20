import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query) {
    return NextResponse.json({ previewUrl: null });
  }

  try {
    const deezerRes = await fetch(`https://deezer.com{encodeURIComponent(query)}&limit=5`);
    const deezerJson = await deezerRes.json();
    const deezerTrack = Array.isArray(deezerJson.data)
      ? deezerJson.data.find((item: { preview?: string }) => item.preview)
      : null;
    if (deezerTrack?.preview) {
      return NextResponse.json({ previewUrl: deezerTrack.preview });
    }
  } catch {
    // Passa al fallback iTunes
  }

  try {
    const itunesRes = await fetch(
      `https://apple.com{encodeURIComponent(query)}&media=music&entity=song&limit=10`
    );
    const itunesJson = await itunesRes.json();
    const itunesTrack = Array.isArray(itunesJson.results)
      ? itunesJson.results.find((item: { previewUrl?: string }) => item.previewUrl)
      : null;
    if (itunesTrack?.previewUrl) {
      return NextResponse.json({ previewUrl: itunesTrack.previewUrl });
    }
  } catch {
    // Nessuna anteprima trovata
  }

  return NextResponse.json({ previewUrl: null });
}
