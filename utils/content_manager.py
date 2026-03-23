import json
import os
from typing import Dict, Any, Optional

class ContentManager:
    """
    Manages persistent storage for generated content (Roadmaps, Lessons, Cheat Sheets).
    Data is stored in JSON files per user.
    """
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.filepath = f"data/content_{user_id}.json"
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        if not os.path.exists(self.filepath):
            self._save_data({})

    def _load_data(self) -> Dict[str, Any]:
        try:
            with open(self.filepath, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}

    def _save_data(self, data: Dict[str, Any]):
        with open(self.filepath, 'w') as f:
            json.dump(data, f, indent=4)

    def _get_key(self, source_lang: str, target_lang: str) -> str:
        return f"{source_lang}_{target_lang}"

    # --- Roadmap ---
    def save_roadmap(self, source_lang: str, target_lang: str, roadmap_data: Dict[str, Any]):
        data = self._load_data()
        key = self._get_key(source_lang, target_lang)
        
        if "roadmaps" not in data:
            data["roadmaps"] = {}
        
        data["roadmaps"][key] = roadmap_data
        self._save_data(data)

    def get_roadmap(self, source_lang: str, target_lang: str) -> Optional[Dict[str, Any]]:
        data = self._load_data()
        key = self._get_key(source_lang, target_lang)
        return data.get("roadmaps", {}).get(key)

    # --- Helper: Cheat Sheets (Reading Material) ---
    def save_cheat_sheet(self, source_lang: str, target_lang: str, topic: str, level: str, content: str):
        data = self._load_data()
        key = self._get_key(source_lang, target_lang)
        
        if "cheat_sheets" not in data:
            data["cheat_sheets"] = {}
        
        if key not in data["cheat_sheets"]:
            data["cheat_sheets"][key] = {}
        
        # Determine a unique ID for the content
        content_id = f"{topic}_{level}"
        data["cheat_sheets"][key][content_id] = content
        self._save_data(data)

    def get_cheat_sheet(self, source_lang: str, target_lang: str, topic: str, level: str) -> Optional[str]:
        data = self._load_data()
        key = self._get_key(source_lang, target_lang)
        content_id = f"{topic}_{level}"
        return data.get("cheat_sheets", {}).get(key, {}).get(content_id)

    # --- Lessons ---
    def save_lesson(self, source_lang: str, target_lang: str, topic: str, lesson_data: Dict[str, Any]):
        data = self._load_data()
        key = self._get_key(source_lang, target_lang)
        
        if "lessons" not in data:
            data["lessons"] = {}
            
        if key not in data["lessons"]:
            data["lessons"][key] = {}
            
        data["lessons"][key][topic] = lesson_data
        self._save_data(data)

    def get_lesson(self, source_lang: str, target_lang: str, topic: str) -> Optional[Dict[str, Any]]:
        data = self._load_data()
        key = self._get_key(source_lang, target_lang)
        return data.get("lessons", {}).get(key, {}).get(topic)
