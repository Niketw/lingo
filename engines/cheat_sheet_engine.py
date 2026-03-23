import os
import json
from groq import Groq
from duckduckgo_search import DDGS
from typing import Dict, Any, Optional

class CheatSheetEngine:
    """
    Combines reading material generation and roadmap/syllabus generation logic.
    A helper engine for advanced content generation.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("Groq API key is required. Set GROQ_API_KEY environment variable.")
        
        self.client = Groq(api_key=self.api_key)
        self.model = "llama-3.3-70b-versatile"

    def _call_ai(self, prompt: str, json_mode: bool = False) -> str:
        try:
            kwargs = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a helpful language learning assistant." + (" Output only valid JSON." if json_mode else "")},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7 if not json_mode else 0.3,
                "max_completion_tokens": 2048,
                "top_p": 1,
                "stream": not json_mode, # Stream only for reading content
                "stop": None
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
                kwargs["stream"] = False

            completion = self.client.chat.completions.create(**kwargs)
            
            if json_mode:
                return completion.choices[0].message.content
            else:
                full_response = ""
                for chunk in completion:
                    content = chunk.choices[0].delta.content or ""
                    full_response += content
                return full_response

        except Exception as e:
            if json_mode:
                return "{}"
            return f"Error connecting to AI Provider: {str(e)}"

    def _search_web(self, query: str) -> str:
        """Perform a quick web search using DuckDuckGo."""
        try:
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=3))
            
            if results:
                formatted_results = []
                for r in results:
                    title = r.get('title', 'No Title')
                    body = r.get('body', 'No Content')
                    formatted_results.append(f"- {title}: {body}")
                return "\n".join(formatted_results)
            
        except Exception as e:
            print(f"Search failed: {e}")
            return ""
            
        return "No usage examples found."

    def generate_reading_material(self, topic: str, target_lang: str, source_lang: str = "English", level: str = "beginner") -> str:
        """
        Generates a detailed reading lesson (cheat sheet) for a specific topic using web search context.
        Returns a Markdown formatted string.
        """
        # 1. Search for context
        search_query = f"{level} {target_lang} lesson {topic} explanation examples grammar for {source_lang} speakers"
        search_context = self._search_web(search_query)
        
        # 2. Structure content with AI
        prompt = f"""
        Create a comprehensive reading lesson/cheat sheet for the topic: "{topic}" in {target_lang} for {level} level learners who speak {source_lang}.
        
        Use the following gathered web info to ensure accuracy and provide cultural/contextual relevance:
        {search_context}
        
        Structure the lesson strictly in Markdown with these sections:
        # {topic}
        
        ## 1. Introduction
        Brief explanation of the concept or topic in {source_lang}.

        ## 2. Vocabulary words
        List 5-8 key vocabulary words or phrases related to the topic with:
        - The word/phrase in {target_lang}
        - Pronunciation guide (phonetic)
        - {source_lang} translation
        
        ## 3. Reading Passage
        A short reading passage (3-5 sentences for beginner, more for advanced) in {target_lang} incorporating the vocabulary.
        Provide the full {source_lang} translation below it.
        
        ## 4. Grammar Note (Optional)
        If there is relevant grammar, explain it simply in {source_lang}.
        
        ## 5. Practice
        A small prompt in {source_lang} for the user to practice (e.g., "Try writing a sentence using...").
        
        CRITICAL: For {target_lang}, ensure characters/script matches standard verified spelling. Do NOT hallucinate characters.
        Example: If Japanese 'Hello', use 'こんにちは' (Konnichiwa), NOT 'しんにちは'.
        
        Return ONLY the Markdown content.
        """
        
        return self._call_ai(prompt, json_mode=False)

    def generate_roadmap(self, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """
        Generates a comprehensive 8-week language learning syllabus/roadmap.
        """
        # Get real-world syllabus context
        query = f"beginner {target_lang} curriculum syllabus for {source_lang} speakers"
        context = self._search_web(query)

        prompt = f"""
        You are an expert curriculum developer.
        Create a comprehensive, detailed 8-week language learning syllabus for a speaker of {source_lang} who wants to learn {target_lang}.
        The syllabus should be structured for a beginner but move quickly to intermediate concepts.
        
        Use the following gathered web info to ensure accuracy and relevance:
        {context}
        
        IMPORTANT: All descriptions, details, and explanations in the output MUST be written in {source_lang}.
        The course title and topics should be in {target_lang} with {source_lang} translations if helpful.

        The output MUST be in valid JSON format with the following structure:
        {{
            "title": "Course Title",
            "modules": [
                {{
                    "week": 1,
                    "topic": "Topic Name",
                    "description": "Detailed description of the learning goals and cultural context for this week in {source_lang}.",
                    "daily_breakdown": [
                        "Day 1: Subtopic details in {source_lang}",
                        "Day 2: Subtopic details in {source_lang}",
                        "Day 3: Practice focus in {source_lang}",
                        "...etc"
                    ],
                    "key_concepts": ["Grammar Rule", "Vocabulary Theme", "Key Phrase"]
                }}
            ]
        }}
        Ensure the 'description' is informative and the 'daily_breakdown' provides actionable study items (at least 3-5 items per week).
        Do not include any text before or after the JSON.
        """
        
        response_content = self._call_ai(prompt, json_mode=True)
        
        try:
            # Handle standard "```json" wrapping just in case
            if response_content.startswith("```json"):
                response_content = response_content[7:]
            if response_content.endswith("```"):
                response_content = response_content[:-3]

            return json.loads(response_content)
        except Exception as e:
            print(f"Error parseing syllabus JSON: {e}")
            return {"title": "Error generating syllabus", "modules": []}
