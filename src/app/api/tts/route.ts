import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text');
  if (!text) return new NextResponse('No text', { status: 400 });

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-IN&client=tw-ob`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Google TTS api failed ' + res.status);
    
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (e: any) {
    console.error(e);
    return new NextResponse(e.message, { status: 500 });
  }
}
