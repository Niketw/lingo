from typing import Dict, Any
from .base_engine import LanguageEngine
import json

class MockLanguageEngine(LanguageEngine):
    """
    Mock engine for offline testing and development.
    Returns static lesson data without needing an API.
    """

    def generate_lesson(self, source_lang: str, target_lang: str, level: str = "beginner", topic: str = "general basics") -> Dict[str, Any]:
        # Return a static mock lesson
        lesson = {
            "vocabulary": [
                {"word": "Hello", "translation": "Namaste" if source_lang == "Hindi" else "Hello in " + source_lang, "pronunciation": "he-low"},
                {"word": "Water", "translation": "Paani" if source_lang == "Hindi" else "Water in " + source_lang, "pronunciation": "wa-ter"},
                {"word": "Food", "translation": "Khaana" if source_lang == "Hindi" else "Food in " + source_lang, "pronunciation": "food"},
                {"word": "Friend", "translation": "Dost" if source_lang == "Hindi" else "Friend in " + source_lang, "pronunciation": "frend"},
                {"word": "Book", "translation": "Kitaab" if source_lang == "Hindi" else "Book in " + source_lang, "pronunciation": "book"}
            ],
            "questions": [
                {
                    "type": "mcq",
                    "question": f"How do you say 'Hello' in {target_lang}?",
                    "options": ["Water", "Hello", "Food", "Book"],
                    "answer": "Hello",
                    "explanation": "'Hello' is the standard greeting."
                },
                {
                    "type": "mcq",
                    "question": f"Translate '{'Paani' if source_lang == 'Hindi' else 'Water equivalent'}' to {target_lang}:",
                    "options": ["Fire", "Earth", "Water", "Sky"],
                    "answer": "Water",
                    "explanation": "It translates to Water."
                },
                {
                    "type": "translation",
                    "question": f"Translate to {target_lang}: I need water.",
                    "answer": "I need water",
                    "explanation": "A basic, essential phrase."
                },
                {
                    "type": "fill-in-the-blank",
                    "question": "I am eating ____.",
                    "answer": "Food",
                    "explanation": "Food is Khaana."
                }
            ]
        }
        return lesson

    def evaluate_answer(self, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        # Simple local evaluation
        correct = str(user_answer).strip().lower() == str(question.get("answer", "")).strip().lower()
        return {
            "correct": correct,
            "feedback": "Great job!" if correct else f"Actually, the correct answer is: {question.get('answer')}"
        }

    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        return f"[Mock Translation of '{text}' to {target_lang}]"

    def chat(self, user_input: str, language: str) -> str:
        return f"[Mock Tutor in {language}]: That's interesting! Keep practicing your {language}!"
