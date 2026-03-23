from typing import Dict, Any, Optional
import json
import re
import os
from groq import Groq
from .base_engine import LanguageEngine

class GroqLanguageEngine(LanguageEngine):
    """
    Language engine implementation using the Groq API (e.g., Llama 3).
    """

    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("GROQ_API_KEY")
        if not key:
            raise ValueError("Groq API key is required. Set GROQ_API_KEY environment variable.")
        self.client = Groq(api_key=key)
        # Using a larger, more capable model for better multi-lingual accuracy
        self.model = "llama-3.3-70b-versatile" 

    def _clean_json_response(self, response_text: str) -> str:
        """
        Robustly extracts JSON from an LLM response.
        Handles markdown blocks, prefatory text, and trailing explanations.
        """
        # 1. Attempt using regex to find JSON code blocks
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if json_match:
            return json_match.group(1)
        
        # 2. Attempt using regex to find ANY code blocks
        code_match = re.search(r'```\s*(\{.*?\})\s*```', response_text, re.DOTALL)
        if code_match:
            return code_match.group(1)
            
        # 3. Attempt finding the first { and last }
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}')
        
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            return response_text[start_idx:end_idx+1]
            
        return response_text

    def generate_lesson(self, source_lang: str, target_lang: str, level: str = "beginner", topic: str = "general basics") -> Dict[str, Any]:
        # Determine vocabulary count and special instructions based on topic
        topic_lower = topic.lower()
        if "alphabet" in topic_lower or "letter" in topic_lower:
            vocab_count = 26
            num_questions = 8
            special_instructions = f"""
            IMPORTANT: You MUST include ALL letters of the {target_lang} alphabet/script as vocabulary entries.
            Each vocabulary entry should have the letter as 'word', its name or equivalent in {source_lang} as 'translation', and how to pronounce it as 'pronunciation'.
            If the language has more or fewer than 26 letters, include ALL of them.
            """
        elif "number" in topic_lower:
            vocab_count = 20
            num_questions = 8
            special_instructions = f"""
            IMPORTANT: You MUST include numbers 1 through 20 in {target_lang} as vocabulary entries.
            Each entry should have the number word in {target_lang} as 'word', the numeral and {source_lang} equivalent as 'translation', and pronunciation as 'pronunciation'.
            Include ALL numbers from 1 to 20 without skipping any.
            """
        else:
            vocab_count = 8
            num_questions = 5
            special_instructions = ""

        language_specific_instruction = ""
        if target_lang in ["Japanese", "Korean", "Chinese", "Mandarin"]:
             language_specific_instruction = f"""
             CRITICAL FOR {target_lang}:
             - Ensure the {target_lang} characters are standard and correct.
             - Double check that the romanization (pronunciation) MATCHES the characters exactly.
             - Do not hallucinate characters.
             - Example verification: If the word is 'Hello', the Japanese must be 'こんにちは' (Konnichiwa), NOT 'しんにちは' (Shinnichiwa).
             """

        prompt = f"""
        You are an expert language teacher.
        Generate a {level} level {target_lang} lesson for a speaker of {source_lang}.
        The topic of this lesson is: "{topic}".
        {special_instructions}
        {language_specific_instruction}
        
        The lesson MUST be in valid JSON format with the following exact structure:
        {{
          "vocabulary": [
            {{"word": "Target language word", "translation": "Source language translation", "pronunciation": "Approximate pronunciation"}}
          ],
          "questions": [
            {{
              "type": "mcq",
              "question": "Question text in {source_lang} or {target_lang}",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "answer": "Correct Option",
              "explanation": "Brief explanation"
            }},
            {{
              "type": "translation",
              "question": "Sentence in {source_lang} to translate to {target_lang}",
              "answer": "Correct translation",
              "explanation": "Brief explanation"
            }},
            {{
              "type": "fill-in-the-blank",
              "question": "Sentence in {target_lang} with a missing word shown as ____",
              "answer": "The missing word",
              "explanation": "Brief explanation"
            }}
          ]
        }}

        Constraints:
        1. Provide exactly {vocab_count} vocabulary items.
        2. Provide exactly {num_questions} questions (mix of mcq, translation, fill-in-the-blank).
        3. STRICT JSON format only. No markdown, no conversational text.
        4. Questions should use the generated vocabulary.
        5. CRITICAL: Ensure ACCURACY. The 'word' (in {target_lang} script), 'pronunciation', and 'translation' MUST all correspond to the exact same concept. Do not mix up entries.
        6. For Japanese/Korean/Chinese, 'word' MUST be in the native script (Kanji/Kana/Hangul), and 'pronunciation' must be the romanization.
        """

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a specialized JSON-outputting educational API. You strictly output valid JSON. Do not converse."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.2,
                max_completion_tokens=4096,
                response_format={"type": "json_object"}
            )
            
            response_text = chat_completion.choices[0].message.content
            cleaned_json = self._clean_json_response(response_text)
            
            return json.loads(cleaned_json)
            
        except Exception as e:
            print(f"Error generating lesson from Groq: {e} | Raw Response snippet: {response_text[:200] if 'response_text' in locals() else 'None'}")
            # Fallback to mock or raise
            raise ValueError(f"Failed to generate lesson via Groq API. Is your API key correct? Error: {e}")

    def evaluate_answer(self, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        # For simplicity and speed, we do local evaluation for exact matches
        # If we wanted pure LLM evaluation for fuzziness, we would call Groq here.
        
        q_type = question.get("type", "")
        correct_answer = str(question.get("answer", "")).strip().lower()
        processed_user = str(user_answer).strip().lower()
        
        # Exact match or substring for mcq/fill-in-the-blank
        if q_type == "mcq" or q_type == "fill-in-the-blank":
            is_correct = processed_user == correct_answer
        else:
            # For translation, let's use a quick LLM check
            eval_prompt = f"""
            Evaluate if the user's translation is correct (ignoring minor punctuation/capitalization).
            Original correct answer: "{correct_answer}"
            User's answer: "{processed_user}"
            
            Respond with JSON:
            {{
                "correct": true/false,
                "feedback": "Short feedback message"
            }}
            """
            try:
                chat_completion = self.client.chat.completions.create(
                    messages=[{"role": "user", "content": eval_prompt}],
                    model=self.model,
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                
                resp = chat_completion.choices[0].message.content
                cleaned_resp = self._clean_json_response(resp)
                return json.loads(cleaned_resp)
            except:
                # Fallback to loose string matching
                is_correct = processed_user in correct_answer or correct_answer in processed_user
                
        return {
            "correct": is_correct,
            "feedback": "Correct!" if is_correct else f"Incorrect. The right answer is: {question.get('answer')}"
        }

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        prompt = f"Translate the following from {source_lang} to {target_lang}. Reply ONLY with the translated text: '{text}'"
        chat_completion = self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.model,
            temperature=0.1,
            max_tokens=100
        )
        return chat_completion.choices[0].message.content.strip()

    def chat(self, user_input: str, language: str) -> str:
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": f"You are a helpful language learning assistant. The user is practicing {language}. Respond appropriately and naturally in {language} to help them practice."},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.7,
                max_tokens=200
            )
            return completion.choices[0].message.content.strip()
        except Exception as e:
            return f"Error connecting to AI Tutor: {str(e)}"
