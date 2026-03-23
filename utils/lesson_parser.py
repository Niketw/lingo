from typing import Dict, Any

class LessonParser:
    """
    Utility class to parse and validate lesson JSON from the language engine.
    Ensures the required format so the UI doesn't crash.
    """

    @staticmethod
    def parse_lesson(lesson_json: Dict[str, Any]) -> Dict[str, Any]:
        # Validate vocabulary
        vocab = lesson_json.get("vocabulary", [])
        if not isinstance(vocab, list):
            lesson_json["vocabulary"] = []
            
        # Validate questions
        questions = lesson_json.get("questions", [])
        if not isinstance(questions, list):
            lesson_json["questions"] = []
            
        # Ensure minimum keys for UI
        for q in lesson_json["questions"]:
            if "type" not in q:
                q["type"] = "translation"
            if "question" not in q:
                q["question"] = "Missing question text"
            if "answer" not in q:
                q["answer"] = "Unknown"
                
            # If MCQ, ensure options exist
            if q["type"] == "mcq" and "options" not in q:
                q["options"] = [q["answer"]]

        return lesson_json

    @staticmethod
    def get_lesson_summary(lesson_json: Dict[str, Any]) -> Dict[str, int]:
        return {
            "vocab_count": len(lesson_json.get("vocabulary", [])),
            "question_count": len(lesson_json.get("questions", []))
        }
