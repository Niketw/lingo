import { groq } from "@ai-sdk/groq";
import { generateObject, generateText, streamText } from "ai";
import { z } from "zod";

import { ChatMessage, LanguageAiPort } from "@/lib/ports/language-ai-port";

export class GroqLanguageAiAdapter implements LanguageAiPort {
  constructor(private readonly modelName: string = "llama-3.3-70b-versatile") {}

  async streamChat(params: {
    systemPrompt: string;
    messages: ChatMessage[];
  }): Promise<Response> {
    const result = await streamText({
      model: groq(this.modelName) as any,
      messages: [{ role: "system", content: params.systemPrompt }, ...params.messages],
    });

    return result.toDataStreamResponse();
  }

  async generateStructured<T>(params: {
    schema: z.ZodType<T>;
    prompt: string;
  }): Promise<T> {
    const { object } = await generateObject({
      model: groq(this.modelName) as any,
      schema: params.schema,
      prompt: params.prompt,
    });

    return object;
  }

  async generatePlainText(prompt: string): Promise<string> {
    const { text } = await generateText({
      model: groq(this.modelName) as any,
      prompt,
    });

    return text;
  }
}

export const languageAiAdapter = new GroqLanguageAiAdapter();
