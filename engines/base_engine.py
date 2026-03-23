from abc import ABC, abstractmethod
from typing import Dict, Any

class LanguageEngine(ABC):
    """
    Abstract base class for language learning engines.
    Uses the Adapter Pattern to support multiple backends (Groq, Mock, OpenAI, etc.)
    """

    @abstractmethod
    def generate_lesson(self, source_lang: str, target_lang: str, level: str = "beginner", topic: str = "general basics") -> Dict[str, Any]:
        """
        Generate a dynamic language lesson containing vocabulary and questions.
        
        Args:
            source_lang: The user's native language (e.g., "Hindi")
            target_lang: The language to learn (e.g., "English")
            level: Difficulty level (e.g., "beginner", "intermediate")
            topic: The specific topic to learn (e.g., "letters", "numbers", "food")
            
        Returns:
            A dictionary containing the lesson structure.
        """
        pass

    @abstractmethod
    def evaluate_answer(self, question: Dict[str, Any], user_answer: str) -> Dict[str, Any]:
        """
        Evaluate a user's answer (optional, can be done locally for MCQs).
        
        Args:
            question: The question dictionary
            user_answer: The user's input
            
        Returns:
            Dictionary with 'correct' (bool) and 'feedback' (str)
        """
        pass

    @abstractmethod
    def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """
        Translate a specific text between languages.
        
        Args:
            text: Text to translate
            source_lang: Source language
            target_lang: Target language
            
        Returns:
            Translated text string
        """
        pass

    @abstractmethod
    def chat(self, user_input: str, language: str) -> str:
        """
        Have a conversational practice with an AI tutor.
        """
        pass
