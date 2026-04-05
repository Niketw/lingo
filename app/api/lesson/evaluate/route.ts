import { groq } from '@ai-sdk/groq';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question, userAnswer, sourceLang, targetLang } = await req.json();

    if (question.type === "mcq") {
      const isCorrect = userAnswer === question.correctAnswer;
      return NextResponse.json({
        correct: isCorrect,
        feedback: isCorrect ? "Spot on!" : `Actually, it should be: ${question.correctAnswer}`
      });
    }

    const evalSchema = z.object({
      correct: z.boolean(),
      feedback: z.string()
    });

    const prompt = `A user whose native language is ${sourceLang} is learning ${targetLang}. They were asked: "${question.question}". 
The correct answer is generally: "${question.correctAnswer}".
The user's answer was: "${userAnswer}".

Evaluate if the user's answer is correct or close enough for partial credit (allow minor typos, variations, or synonyms).
Return a JSON object with:
1. "correct": boolean true or false.
2. "feedback": A very brief, friendly sentence validating or explaining the correction.`;

    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile') as any,
      schema: evalSchema,
      prompt: prompt,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}
