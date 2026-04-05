import { groq } from '@ai-sdk/groq';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { sourceLang, targetLang, level = "beginner", topic } = await req.json();

    const lessonSchema = z.object({
      vocabulary: z.array(z.object({
        word: z.string(),
        translation: z.string(),
        pronunciation: z.string().optional()
      })),
      questions: z.array(z.object({
        type: z.enum(["mcq", "translation", "fill_in_blank"]),
        question: z.string(),
        options: z.array(z.string()).optional(),
        correctAnswer: z.string()
      }))
    });

    let structuralInstructions = `
Generate a JSON object with:
1. "vocabulary": A list of 5-8 key words/phrases with their "word" (in ${targetLang}), "translation" (in ${sourceLang}), and "pronunciation".
2. "questions": A list of 5-8 interactive questions to test the user's knowledge. Include a mix of:
   - "mcq" (Multiple Choice Question with 4 "options" and the "correctAnswer").
   - "translation" (Translate a sentence, provide the "correctAnswer").
   - "fill_in_blank" (Provide a sentence with a blank ____, provide the "correctAnswer").
`;

    const lowerTopic = (topic || "").toLowerCase();
    if (lowerTopic.includes("alphabet") || lowerTopic.includes("letters")) {
      structuralInstructions = `
Generate a JSON object with:
1. "vocabulary": A comprehensive list containing EVERY SINGLE letter/character in the ${targetLang} alphabet/writing system, with its "word" (the character in ${targetLang}), "translation" (the name or pronunciation equivalent in ${sourceLang}), and "pronunciation". Ensure ALL standard alphabet letters are included (e.g., A-Z for English, full Katakana/Hiragana subsets for Japanese, complete Devanagari consonants/vowels for Hindi, etc.). DO NOT stop at 5-8 items.
2. "questions": A list of 8-10 interactive questions to quiz the user on the alphabet. Include a mix of "mcq" and "translation" types.
`;
    } else if (lowerTopic.includes("number")) {
      structuralInstructions = `
Generate a JSON object with:
1. "vocabulary": A comprehensive list containing the numbers from 0 to 20 in ${targetLang}, with their "word" (the number written in ${targetLang}), "translation" (the number digit in ${sourceLang}), and "pronunciation". Ensure ALL numbers 0-20 are strictly included (21 items total).
2. "questions": A list of 8-10 interactive questions to quiz the user on numbers. Include a mix of "mcq" and "translation" types.
`;
    }

    const prompt = `You are a language teacher creating a lesson for someone who speaks ${sourceLang} and wants to learn ${targetLang}. The lesson level is ${level} and the topic is "${topic}".
${structuralInstructions}`;

    const { object } = await generateObject({
      model: groq('llama-3.3-70b-versatile') as any,
      schema: lessonSchema,
      prompt: prompt,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate lesson" }, { status: 500 });
  }
}
