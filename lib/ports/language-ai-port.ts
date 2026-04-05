import { z } from "zod";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface LanguageAiPort {
  streamChat(params: {
    systemPrompt: string;
    messages: ChatMessage[];
  }): Promise<Response>;
  generateStructured<T>(params: {
    schema: z.ZodType<T>;
    prompt: string;
  }): Promise<T>;
  generatePlainText(prompt: string): Promise<string>;
}
