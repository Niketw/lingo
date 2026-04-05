import { NextRequest, NextResponse } from 'next/server';
import {
  languageAiAdapter,
} from "@/lib/adapters/groq-language-ai-adapter";
import { ChatMessage } from "@/lib/ports/language-ai-port";

export async function POST(req: NextRequest) {
  try {
    const { messages, targetLang } = await req.json();

    const systemPrompt = `You are a helpful, enthusiastic AI tutor helping the user practice ${targetLang}. 
Keep your responses short, natural, and encouraging. Always respond in ${targetLang} unless asked otherwise or grammatical translation is needed.`;

    return languageAiAdapter.streamChat({
      systemPrompt,
      messages: (messages ?? []) as ChatMessage[],
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed chat" }, { status: 500 });
  }
}
