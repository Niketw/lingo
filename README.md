# Local Language Learning Buddy 🦉

A lightweight, local, Duolingo-like language learning application built with Streamlit and Python. It dynamically generates lessons using the Groq API (or runs offline with simulated Mock data) to help you bridge the gap between regional languages and target languages (default: English).

## Features
- **Local Application:** Entirely self-hosted on your machine.
- **Adapter Architecture:** Choose between Groq API (LLaMA-3 inference) or a Local Mock Engine.
- **Dynamic Lessons:** Each lesson creates contextual vocabulary and 3 variations of questions (MCQ, translation, fill-in-the-blank).
- **Gamification:** Tracks your Streak, XP, and Level locally using a lightweight JSON database.
- **Mobile-Friendly UI:** Designed using Streamlit for clean desktop or mobile browser interaction.

## Architecture
The application uses the **Adapter Pattern** for the Language core engine. It allows interchangeable use of AI models without rewriting app logic.
- `LanguageEngine` (Base Class)
- `GroqLanguageEngine` (Implements Groq API for lesson JSON generation)
- `MockLanguageEngine` (Implementation for offline development/testing)

## Setup Instructions

1. **Ensure you have Python 3.9+** installed.
2. **Install requirements:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure Groq API Key (Optional but recommended):**
   The application requires the Groq API to generate unique lessons dynamically. 
   Set your API key as an environment variable in your terminal:
   - On **Windows**: `set GROQ_API_KEY=your_api_key_here`
   - On **Mac/Linux**: `export GROQ_API_KEY=your_api_key_here`
   
   *If the API key is not set, the app will smoothly fallback to the `MockLanguageEngine` for testing.*

## How to Run Locally

Run the Streamlit application from the project root directory:

```bash
streamlit run app.py
```

This will automatically open a local web server (usually `http://localhost:8501`) in your default web browser.

## Sample JSON Formatting
The LLM engine strictly responds with predefined JSON. Below is an example structure:

```json
{
  "vocabulary": [
    {
      "word": "Book",
      "translation": "Kitaab",
      "pronunciation": "book"
    }
  ],
  "questions": [
    {
      "type": "mcq",
      "question": "How do you say 'Book' in English?",
      "options": ["Water", "Book", "Food", "Car"],
      "answer": "Book",
      "explanation": "'Kitaab' translates to 'Book'."
    },
    {
      "type": "translation",
      "question": "Translate to English: Mujhe kitaab chahiye.",
      "answer": "I need a book.",
      "explanation": "Essential phrase structure."
    }
  ]
}
```

Enjoy learning new languages entirely locally!
