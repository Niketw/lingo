import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, targetLang } = await req.json();

    const systemPrompt = `You are a helpful, enthusiastic AI tutor helping the user practice ${targetLang}. 
Keep your responses short, natural, and encouraging. Always respond in ${targetLang} unless asked otherwise or grammatical translation is needed.`;

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile') as any,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed chat" }, { status: 500 });
  }
}
