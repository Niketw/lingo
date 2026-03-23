import json
import os
from datetime import datetime, date

class ProgressTracker:
    """
    Utility class to read and write user progress to a local JSON file.
    Tracks XP, Streak, and completed lessons.
    """

    def __init__(self, filepath: str = "data/progress.json"):
        self.filepath = filepath
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        if not os.path.exists(self.filepath):
            self._save_data(self._default_data())

    def _default_data(self):
        return {
            "xp": 0,
            "streak": 0,
            "level": 1,
            "last_active_date": None,
            "completed_lessons": 0
        }

    def _load_data(self):
        try:
            with open(self.filepath, 'r') as f:
                data = json.load(f)
                if not isinstance(data, dict):
                    return self._default_data()
                # Merge with default to ensure all keys exist
                result = self._default_data()
                result.update(data)
                return result
        except (json.JSONDecodeError, FileNotFoundError):
            return self._default_data()

    def _save_data(self, data):
        with open(self.filepath, 'w') as f:
            json.dump(data, f, indent=4)

    def get_progress(self):
        data = self._load_data()
        self._update_streak(data)
        return data

    def _update_streak(self, data):
        today = date.today().isoformat()
        last_active = data.get("last_active_date")
        
        if last_active:
            last_date = date.fromisoformat(last_active)
            delta = (date.today() - last_date).days
            
            # If they missed a day, reset streak
            if delta > 1:
                data["streak"] = 0
                self._save_data(data)

    def add_xp(self, amount: int):
        data = self._load_data()
        today = date.today().isoformat()
        
        # Update streak if today is a new active day
        if data.get("last_active_date") != today:
            data["streak"] += 1
            data["last_active_date"] = today

        data["xp"] += amount
        data["completed_lessons"] += 1
        
        # Level up logic: every 100 XP is a new level
        data["level"] = (data["xp"] // 100) + 1
        
        self._save_data(data)
