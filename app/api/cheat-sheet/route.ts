import { NextRequest, NextResponse } from 'next/server';
import {
  languageAiAdapter,
} from "@/lib/adapters/groq-language-ai-adapter";

export async function POST(req: NextRequest) {
  try {
    const { topic, sourceLang, targetLang, level } = await req.json();

    const prompt = `Create a Markdown cheat sheet for a ${level} level student whose native language is ${sourceLang} and who wants to learn about "${topic}" in ${targetLang}. 

Include:
- A brief introduction.
- Key vocabulary (5-10 terms with definitions).
- Key phrases/sentences.
- Quick grammatical tips relevant to the topic.
Format entirely in Markdown. Make it fun, engaging, and easy to read.
`;

    const text = await languageAiAdapter.generatePlainText(prompt);

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed cheat sheet" }, { status: 500 });
  }
}
