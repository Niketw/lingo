import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { sourceLang, targetLang } = await req.json();

    const roadmapSchema = z.object({
      title: z.string(),
      modules: z.array(z.object({
        week: z.number(),
        topic: z.string(),
        description: z.string(),
        daily_breakdown: z.array(z.string())
      }))
    });

    const prompt = `Create an 8-week curriculum roadmap for a beginner ${targetLang} learner who natively speaks ${sourceLang}.

Return a JSON object:
- title: string
- modules: array of objects (week: 1-8, topic: string, description: brief string, daily_breakdown: array of 7 short actionable bullet points for each day).
`;

    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile') as any,
      schema: roadmapSchema,
      prompt: prompt,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
