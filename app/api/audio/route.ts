import { NextResponse } from 'next/server';
import * as googleTTS from 'google-tts-api';

export async function POST(req: Request) {
  try {
    const { text, lang } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const langCode = lang || 'en';
    
    // googleTTS gives us a URL to fetch the MP3 from
    const url = googleTTS.getAudioUrl(text, {
      lang: langCode,
      slow: false,
      host: 'https://translate.google.com',
    });

    const audioRes = await fetch(url);
    if (!audioRes.ok) {
      throw new Error('Failed to fetch audio from Google TTS');
    }
    
    const buffer = await audioRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error: any) {
    console.error('Error generating audio:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}