import streamlit as st
import os
import json
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Styling and config
st.set_page_config(page_title="Language Buddy", page_icon="🦉", layout="centered", initial_sidebar_state="collapsed")

# Custom CSS for Duolingo-like dark mode feel
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap');
    
    body, .stApp {
        font-family: 'Nunito', sans-serif;
    }

    h1, h2, h3, h4, h5, h6, p, li, button, input, label, textarea, .stMarkdown {
        font-family: 'Nunito', sans-serif !important;
    }
    
    /* Global Styles */
    .stApp, header, .stApp > header {
        background-color: #131F24 !important;
        color: #FFFFFF !important;
    }
    .stMarkdown, p, h1, h2, h3, h4, h5, h6, span {
        color: #FFFFFF !important;
    }
    .big-font {
        font-size: 28px !important;
        font-weight: 800 !important;
    }
    .medium-font {
        font-size: 20px !important;
        font-weight: 700 !important;
        color: #AFAFAF !important;
    }
    /* Primary Buttons (Big Green, type="primary") */
    button[kind="primary"] {
        width: 100%;
        border-radius: 16px !important;
        height: 55px !important;
        font-weight: 800 !important;
        font-size: 18px !important;
        background-color: #58CC02 !important;
        color: white !important;
        border: none !important;
        border-bottom: 4px solid #58A700 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        transition: all 0.1s !important;
    }
    button[kind="primary"]:active {
        border-bottom: 0px !important;
        transform: translateY(4px) !important;
    }
    button[kind="primary"]:hover {
        background-color: #61E002 !important;
        color: white !important;
    }
    
    /* Secondary Buttons (Topics, Defaults, type="secondary") */
    button[kind="secondary"] {
        width: 100%;
        border-radius: 16px !important;
        height: 55px !important;
        font-weight: 800 !important;
        font-size: 18px !important;
        background-color: #202F36 !important;
        color: #1CB0F6 !important;
        text-transform: none !important;
        letter-spacing: 0px !important;
        border: 2px solid #37464F !important;
        border-bottom: 4px solid #37464F !important;
        transition: all 0.1s !important;
    }
    button[kind="secondary"]:active {
        border-bottom: 0px !important;
        transform: translateY(4px) !important;
    }
    button[kind="secondary"]:hover {
        background-color: #2A3A41 !important;
        border: 2px solid #1CB0F6 !important;
        border-bottom: 4px solid #1899D6 !important;
        color: #1CB0F6 !important;
    }
    
    /* Tertiary Buttons (Text Hyperlinks, type="tertiary") */
    button[kind="tertiary"] {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        color: #1CB0F6 !important;
        padding: 0 !important;
        min-height: 0 !important;
        height: auto !important;
        display: block !important;
        margin: 0 auto !important;
        font-weight: 700 !important;
        font-size: 16px !important;
        text-transform: none !important;
        width: auto !important;
    }
    button[kind="tertiary"] p {
        color: #1CB0F6 !important;
        font-size: 16px !important;
        font-weight: 700 !important;
        margin: 0 !important;
    }
    button[kind="tertiary"]:hover p, button[kind="tertiary"]:hover {
        color: #1899D6 !important;
        text-decoration: underline !important;
        background: transparent !important;
    }
    .link-btn [data-testid="stButton"] {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    /* Metric Cards */
    .metric-card {
        background-color: #202F36;
        padding: 15px;
        border-radius: 20px;
        border: 2px solid #37464F;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }
    
    /* Inputs */
    .stTextInput>div>div>input, div[data-baseweb="select"] > div {
        background-color: #202F36 !important;
        color: #FFFFFF !important;
        border-radius: 15px !important;
        border: 2px solid #37464F !important;
        font-weight: 700 !important;
    }
    
    /* Radio options */
    div[role="radiogroup"] > label {
        background-color: #202F36 !important;
        color: #FFFFFF !important;
        border: 2px solid #37464F !important;
        border-bottom: 4px solid #37464F !important;
        border-radius: 12px !important;
        padding: 15px !important;
        margin-bottom: 10px !important;
        font-weight: 800 !important;
        transition: all 0.1s !important;
    }
    div[role="radiogroup"] > label:hover {
        background-color: #2A3A41 !important;
        border-color: #1CB0F6 !important;
    }
    
    /* Sidebar */
    section[data-testid="stSidebar"] {
        background-color: #131F24 !important;
        border-right: 2px solid #37464F !important;
    }
</style>
""", unsafe_allow_html=True)

# Imports for core logic
from utils.progress_tracker import ProgressTracker
from utils.lesson_parser import LessonParser
from utils.auth import authenticate, create_user
from utils.content_manager import ContentManager

# We can toggle between Mock and Groq engines here based on API key presence
from engines.mock_engine import MockLanguageEngine
from engines.groq_engine import GroqLanguageEngine
from engines.cheat_sheet_engine import CheatSheetEngine

def init_session_state():
    if "user_id" not in st.session_state:
        st.session_state.user_id = None
    if "onboarding_complete" not in st.session_state:
        st.session_state.onboarding_complete = False
    if "page" not in st.session_state:
        st.session_state.page = "get_started" if not st.session_state.onboarding_complete else "home"
    if "source_lang" not in st.session_state:
        st.session_state.source_lang = "English"
    if "target_lang" not in st.session_state:
        st.session_state.target_lang = "Spanish"
    if "selected_topic" not in st.session_state:
        st.session_state.selected_topic = "general basics"
    if "lesson_data" not in st.session_state:
        st.session_state.lesson_data = None
    if "current_question_idx" not in st.session_state:
        st.session_state.current_question_idx = 0
    if "correct_answers" not in st.session_state:
        st.session_state.correct_answers = 0
    if "show_feedback" not in st.session_state:
        st.session_state.show_feedback = False
    if "feedback_data" not in st.session_state:
        st.session_state.feedback_data = None
    if "reading_content" not in st.session_state:
        st.session_state.reading_content = ""
    if "roadmap_data" not in st.session_state:
        st.session_state.roadmap_data = None
    if "engine" not in st.session_state:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key:
            st.session_state.engine = GroqLanguageEngine(api_key=groq_api_key)
        else:
            st.session_state.engine = MockLanguageEngine()
    if "cheat_sheet_engine" not in st.session_state:
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key:
            st.session_state.cheat_sheet_engine = CheatSheetEngine(api_key=groq_api_key)
        else:
            st.session_state.cheat_sheet_engine = None

def get_progress_tracker():
    return ProgressTracker()

def navigate(page_name):
    st.session_state.page = page_name
    st.rerun()

def show_get_started():
    st.markdown("<p class='big-font' style='text-align: center;'>🌍 Welcome to Language Buddy</p>", unsafe_allow_html=True)
    st.markdown("<p class='medium-font' style='text-align: center;'>Learn a language for free. Forever.</p>", unsafe_allow_html=True)
    
    st.write("---")
    
    source_options = ["English", "Hindi", "Marathi", "Tamil", "Bengali", "Gujarati", "Telugu", "Kannada", "Malayalam"]
    st.session_state.source_lang = st.selectbox("I speak:", source_options, index=source_options.index(st.session_state.source_lang) if st.session_state.source_lang in source_options else 0)
    
    target_options = ["Spanish", "French", "German", "English", "Japanese", "Korean", "Italian"]
    st.session_state.target_lang = st.selectbox("I want to learn:", target_options, index=target_options.index(st.session_state.target_lang) if st.session_state.target_lang in target_options else 0)
    
    st.write("---")
    
    col_g1, col_g2 = st.columns([1, 1])
    with col_g2:
        if st.button("Get Started!", type="primary"):
            st.session_state.onboarding_complete = True
            navigate("home")
    with col_g1:
        # Only show back button if user has already onboarded (Change Language flow)
        if st.session_state.get("onboarding_complete", False):
            if st.button("Back to Home", type="secondary"):
                navigate("home")
        else:
             st.write("") # Spacer if no back button

def show_home():
    tracker = get_progress_tracker()
    progress = tracker.get_progress()

    col_h1, col_h2 = st.columns([3, 1])
    with col_h1:
        st.markdown(f"<p class='big-font'>Learn {st.session_state.target_lang}!</p>", unsafe_allow_html=True)
    with col_h2:
        if st.button("Logout", type="secondary"):
            st.session_state.user_id = None
            st.rerun()
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(f'<div class="metric-card">🔥<br><b>{progress["streak"]}</b><br>Streak</div>', unsafe_allow_html=True)
    with col2:
        st.markdown(f'<div class="metric-card">⭐<br><b>{progress["xp"]}</b><br>XP</div>', unsafe_allow_html=True)
    with col3:
        st.markdown(f'<div class="metric-card">🎓<br><b>Lv. {progress["level"]}</b><br>Level</div>', unsafe_allow_html=True)
        
    st.write("---")
    st.markdown("### Choose your path")
    
    topics = [
        ("🔤 Letters & Alphabet", "Alphabet and Letters"),
        ("🔢 Numbers 1-20", "Numbers and Tracking"),
        ("👋 Basic Greetings", "Basic Greetings and Introductions"),
        ("✈️ Travel Essentials", "Travel and Navigation Phrases"),
        ("🍔 Food & Dining", "Food, Drink, and Ordering"),
        ("🎲 Random Practice", "General mixed practice")
    ]
    
    for display_name, topic_prompt in topics:
        if st.button(display_name, type="secondary"):
            st.session_state.selected_topic = topic_prompt
            navigate("lesson_loading")

    st.write("---")
    st.markdown("### 🧠 AI Power Tools")
    
    col_tools1, col_tools2 = st.columns(2)
    with col_tools1:
        if st.button("🗺️ Course Roadmap", type="secondary"):
             navigate("roadmap_loading")
    with col_tools2:
        if st.button("📜 Cheat Sheets", type="secondary"):
            navigate("cheat_sheet_options")
            
    st.write("---")
    
    col_f1, col_f2 = st.columns(2)
    with col_f1:
        if st.button("💬 Chat Practice", type="primary"):
            navigate("chat")
    with col_f2:
        if st.button("Change Language 🌍", type="secondary"):
            navigate("get_started")

def show_chat():
    st.title("💬 Chat Practice")
    st.write(f"Practice your {st.session_state.target_lang} skills with our AI tutor!")
    
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []
        
    for message in st.session_state.chat_history:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input("Say something in your target language..."):
        st.chat_message("user").markdown(prompt)
        st.session_state.chat_history.append({"role": "user", "content": prompt})

        response = st.session_state.engine.chat(prompt, st.session_state.target_lang)
        with st.chat_message("assistant"):
            st.markdown(response)
        st.session_state.chat_history.append({"role": "assistant", "content": response})

    st.write("---")
    if st.button("Back to Home 🏠", type="secondary"):
        navigate("home")

def fetch_lesson(source_lang, target_lang, topic, _engine):
    raw_lesson = _engine.generate_lesson(source_lang, target_lang, level="beginner", topic=topic)
    return LessonParser.parse_lesson(raw_lesson)

def show_lesson_loading():
    st.markdown("<p class='big-font' style='text-align: center;'>Generating your lesson...</p>", unsafe_allow_html=True)
    st.markdown(f"<p style='text-align: center;'>Focus: <b>{st.session_state.selected_topic}</b></p>", unsafe_allow_html=True)
    
    user_id = st.session_state.get("user_id")
    source_lang = st.session_state.source_lang
    target_lang = st.session_state.target_lang
    topic = st.session_state.selected_topic
    
    cm = ContentManager(str(user_id))
    
    existing = cm.get_lesson(source_lang, target_lang, topic)
    if existing:
        st.session_state.lesson_data = existing
        # Reset state
        st.session_state.current_question_idx = 0
        st.session_state.correct_answers = 0
        st.session_state.show_feedback = False
        navigate("vocab_intro")
        return
    
    with st.spinner("Building interactive exercises..."):
        try:
            lesson_data = fetch_lesson(source_lang, target_lang, topic, st.session_state.engine)
            
            # Save
            cm.save_lesson(source_lang, target_lang, topic, lesson_data)
            
            st.session_state.lesson_data = lesson_data
            
            # Reset state
            st.session_state.current_question_idx = 0
            st.session_state.correct_answers = 0
            st.session_state.show_feedback = False
            
            navigate("vocab_intro")
        except Exception as e:
            st.error(f"Error generating lesson: {e}")
            if st.button("Back", type="secondary"):
                navigate("home")

def get_lang_code(language_name):
    codes = {
        "English": "en", "Spanish": "es", "French": "fr", "German": "de", 
        "Japanese": "ja", "Korean": "ko", "Italian": "it", "Hindi": "hi",
        "Marathi": "mr", "Tamil": "ta", "Bengali": "bn", "Gujarati": "gu",
        "Telugu": "te", "Kannada": "kn", "Malayalam": "ml"
    }
    return codes.get(language_name, "en")

def show_vocab_intro():
    st.markdown("<p class='big-font'>📖 New Words</p>", unsafe_allow_html=True)
    st.write("Learn these words to ace the exercises!")
    
    vocab = st.session_state.lesson_data.get("vocabulary", [])
    if not vocab:
        st.info("Let's jump straight into practice!")
    else:
        for item in vocab:
            word = item.get('word')
            st.markdown(f"### **{word}**")
            st.markdown(f"{item.get('translation')} _({item.get('pronunciation', '')})_")
            
            # Text-to-Speech
            try:
                from gtts import gTTS
                import io
                target_code = get_lang_code(st.session_state.target_lang)
                if word and str(word).strip():
                    tts = gTTS(text=str(word), lang=target_code)
                    fp = io.BytesIO()
                    tts.write_to_fp(fp)
                    fp.seek(0)
                    st.audio(fp, format='audio/mp3')
            except Exception as e:
                # If language is not supported by gTTS or other error
                # st.error(f"Audio not available: {e}")
                st.caption("Audio unavailable")
            
            st.divider()
            
    col_v1, col_v2 = st.columns(2)
    with col_v1:
        if st.button("Back to Home", type="secondary"):
            navigate("home")
    with col_v2:
        if st.button("Start Exercises 💪", type="primary"):
            navigate("lesson_interactive")

def show_lesson_interactive():
    questions = st.session_state.lesson_data.get("questions", [])
    total_q = len(questions)
    
    if st.session_state.current_question_idx >= total_q:
        navigate("results")
        return
        
    # Top bar with Exit button and Progress
    col_q1, col_q2 = st.columns([1, 5])
    with col_q1:
        if st.button("❌ Quit", type="tertiary", help="Exit lesson"):
            navigate("home")
    with col_q2:
        # Progress bar
        progress = st.session_state.current_question_idx / total_q
        st.progress(progress)
    
    q = questions[st.session_state.current_question_idx]
    
    st.markdown(f"**Question {st.session_state.current_question_idx + 1} of {total_q}**")
    st.markdown(f"<p class='big-font'>{q.get('question')}</p>", unsafe_allow_html=True)
    
    q_type = q.get("type", "translation")
    
    user_answer = None
    submit = False
    
    if not st.session_state.show_feedback:
        if q_type == "mcq":
            options = q.get("options", [])
            user_answer = st.radio("Select the correct answer:", options, index=None, label_visibility="collapsed")
            st.write(" ")
            if st.button("Check Answer", type="primary"):
                submit = True
        else:
            user_answer = st.text_input("Type your answer here:")
            st.write(" ")
            if st.button("Check Answer", type="primary"):
                submit = True
                
        if submit and user_answer:
            eval_result = st.session_state.engine.evaluate_answer(q, user_answer)
            st.session_state.feedback_data = eval_result
            st.session_state.show_feedback = True
            if eval_result.get("correct", False):
                st.session_state.correct_answers += 1
            st.rerun()
        elif submit and not user_answer:
            st.warning("Please provide an answer first.")
    else:
        # Show Feedback State
        if q_type == "mcq":
            st.radio("Your selection:", q.get("options", []), disabled=True)
        else:
            st.text_input("Your answer:", disabled=True)
            
        is_correct = st.session_state.feedback_data.get("correct", False)
        feedback_msg = st.session_state.feedback_data.get("feedback", "")
        
        st.markdown(f"""
        <div style="background-color: {'#202F36' if is_correct else '#311C20'}; padding: 20px; border-radius: 15px; margin-top: 20px; border: 2px solid {'#58CC02' if is_correct else '#EA2B2B'};">
            <h2 style="color: {'#58CC02' if is_correct else '#EA2B2B'} !important; margin-top: 0;">{"✅ You're correct!" if is_correct else "❌ Incorrect"}</h2>
            <p style="color: {'#58CC02' if is_correct else '#EA2B2B'} !important; font-size: 20px; font-weight: 700;">{feedback_msg}</p>
        </div>
        """, unsafe_allow_html=True)
        
        st.write(" ")
        if st.button("Continue", type="primary"):
            st.session_state.show_feedback = False
            st.session_state.current_question_idx += 1
            st.rerun()

def show_results():
    st.markdown("<p class='big-font' style='text-align: center;'>🎉 Lesson Completed!</p>", unsafe_allow_html=True)
    
    questions = st.session_state.lesson_data.get("questions", [])
    total_q = len(questions)
    correct = st.session_state.correct_answers
    
    score = int((correct / total_q) * 100) if total_q > 0 else 0
    xp_gained = correct * 10
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f'<div class="metric-card"><p class="medium-font">Score</p><h2>{score}%</h2></div>', unsafe_allow_html=True)
    with col2:
        st.markdown(f'<div class="metric-card"><p class="medium-font">XP Gained</p><h2>+{xp_gained}</h2></div>', unsafe_allow_html=True)
        
    st.write(" ")
    
    # Update progress
    tracker = get_progress_tracker()
    tracker.add_xp(xp_gained)
    
    st.write("---")
    if st.button("Continue", type="primary"):
        # Reset state
        st.session_state.lesson_data = None
        navigate("home")

def show_cheat_sheet_options():
    st.markdown("<p class='big-font'>📜 Cheat Sheet Generator</p>", unsafe_allow_html=True)
    st.markdown(f"Create a custom study guide for any topic in **{st.session_state.target_lang}**.")
    
    st.session_state.selected_topic = st.text_input("Enter a topic (e.g. 'Coffee Shop', 'Business Meetings', 'Flirting'):", value="Travel")
    level = st.select_slider("Difficulty Level:", options=["Beginner", "Intermediate", "Advanced"], value="Beginner")
    
    if st.button("Generate Cheat Sheet ✨", type="primary"):
        st.session_state.cheat_sheet_level = level
        navigate("reading_loading")
        
    st.write("---")
    if st.button("Back to Home", type="secondary"):
        navigate("home")

def show_reading_loading():
    st.markdown("<p class='big-font' style='text-align: center;'>Generating Cheat Sheet...</p>", unsafe_allow_html=True)
    topic = st.session_state.selected_topic
    
    st.info(f"Topic: {topic}")
    
    user_id = st.session_state.get("user_id")
    source_lang = st.session_state.source_lang
    target_lang = st.session_state.target_lang
    level = st.session_state.get("cheat_sheet_level", "Beginner")
    
    cm = ContentManager(str(user_id))
    
    # 1. Check persistent storage
    existing = cm.get_cheat_sheet(source_lang, target_lang, topic, level)
    if existing:
        st.session_state.reading_content = existing
        navigate("reading_view")
        return

    if not st.session_state.cheat_sheet_engine:
        st.error("This feature requires a generic LLM key (Groq).")
        if st.button("Back"):
             navigate("home")
        return

    with st.spinner("Researching and writing your guide..."):
        try:
            content = st.session_state.cheat_sheet_engine.generate_reading_material(
                topic=topic,
                target_lang=target_lang,
                source_lang=source_lang,
                level=level
            )
            
            # 2. Save
            cm.save_cheat_sheet(source_lang, target_lang, topic, level, content)
            
            st.session_state.reading_content = content
            navigate("reading_view")
        except Exception as e:
            st.error(f"Error: {e}")
            if st.button("Back"):
                navigate("cheat_sheet_options")

def show_reading_view():
    st.markdown(f"<p class='big-font'>📜 {st.session_state.selected_topic}</p>", unsafe_allow_html=True)
    
    st.markdown(st.session_state.reading_content) # Render MD
    
    st.write("---")
    col1, col2 = st.columns(2)
    with col1:
        if st.session_state.get("back_page") == "roadmap_view":
             if st.button("Back to Roadmap 🗺️", type="secondary"):
                 st.session_state.back_page = None
                 navigate("roadmap_view")
        else:
             if st.button("New Topic 🔄", type="secondary"):
                 navigate("cheat_sheet_options")
    with col2:
        if st.button("Home 🏠", type="primary"):
            navigate("home")

def show_roadmap_loading():
    st.markdown("<p class='big-font' style='text-align: center;'>Designing your Course...</p>", unsafe_allow_html=True)
    
    user_id = st.session_state.get("user_id")
    source_lang = st.session_state.source_lang
    target_lang = st.session_state.target_lang
    
    cm = ContentManager(str(user_id))
    
    # 1. Check persistent storage first
    existing = cm.get_roadmap(source_lang, target_lang)
    if existing:
        st.session_state.roadmap_data = existing
        navigate("roadmap_view")
        return

    if not st.session_state.cheat_sheet_engine:
         st.error("This feature requires a generic LLM key (Groq).")
         if st.button("Back"):
             navigate("home")
         return

    with st.spinner("Analyzing curriculum standards..."):
        try:
            roadmap = st.session_state.cheat_sheet_engine.generate_roadmap(
                source_lang=source_lang,
                target_lang=target_lang
            )
            # 2. Save to persistent storage
            cm.save_roadmap(source_lang, target_lang, roadmap)
            
            st.session_state.roadmap_data = roadmap
            navigate("roadmap_view")
        except Exception as e:
            st.error(f"Error: {e}")
            if st.button("Back"):
                navigate("home")

def show_roadmap_view():
    st.markdown("<p class='big-font'>🗺️ Your Roadmap</p>", unsafe_allow_html=True)
    
    data = st.session_state.roadmap_data
    if not data:
        st.error("No data found.")
        if st.button("Back"): navigate("home")
        return

    st.markdown(f"### {data.get('title', 'Overview')}")
    
    for module in data.get('modules', []):
        with st.expander(f"Week {module.get('week')}: {module.get('topic')}"):
            st.write(module.get('description'))
            st.markdown("**Daily Plan:**")
            for day in module.get('daily_breakdown', []):
                st.markdown(f"- {day}")
            
            st.markdown("---")
            col_rm1, col_rm2 = st.columns(2)
            with col_rm1:
                if st.button(f"Start Lesson", key=f"road_btn_{module.get('week')}", type="primary"):
                    st.session_state.selected_topic = module.get('topic')
                    navigate("lesson_loading")
            with col_rm2:
                if st.button(f"Generate Resources", key=f"road_res_{module.get('week')}", type="secondary"):
                    st.session_state.selected_topic = module.get('topic')
                    st.session_state.cheat_sheet_level = "Beginner"
                    st.session_state.back_page = "roadmap_view"
                    navigate("reading_loading")
    
    st.write("---")
    if st.button("Back to Home", type="primary"):
        navigate("home")

def show_auth():
    st.markdown("<br><br>", unsafe_allow_html=True)
    
    if "auth_mode" not in st.session_state:
        st.session_state.auth_mode = "Login"
        
    mode = st.session_state.auth_mode
    
    col1, col2, col3 = st.columns([1.5, 2, 1.5])
    with col2:
        st.markdown("<h2 style='text-align: center; color: #58CC02; font-weight: 800; font-size: 32px;'>Language Buddy</h2>", unsafe_allow_html=True)
        st.markdown(f"<p style='text-align: center; color: #AFAFAF; font-size: 16px; margin-bottom: 30px;'>{'Sign in to save progress' if mode == 'Login' else 'Create your account to start learning!'}</p>", unsafe_allow_html=True)
        
        username = st.text_input("Username", placeholder="Username", key="auth_user", label_visibility="collapsed")
        password = st.text_input("Password", type="password", placeholder="Password", key="auth_pass", label_visibility="collapsed")
        
        # Toggle Link Button FIRST
        st.markdown('<div class="link-btn" style="text-align: center; margin-top: 15px; margin-bottom: 15px;">', unsafe_allow_html=True)
        if mode == "Login":
            if st.button("Don't have an account? Sign up", key="toggle_signup", type="tertiary"):
                st.session_state.auth_mode = "Signup"
                st.rerun()
        else:
            if st.button("Already have an account? Login", key="toggle_login", type="tertiary"):
                st.session_state.auth_mode = "Login"
                st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Main Auth Button
        submitted = st.button("LOGIN" if mode == "Login" else "CREATE ACCOUNT", key="auth_main_btn", type="primary")
            
        if submitted:
            if not username or not password:
                st.warning("Please enter both username and password.")
                return
                
            if mode == "Login":
                user_id = authenticate(username, password)
                if user_id:
                    st.session_state.user_id = user_id
                    st.success("Welcome back!")
                    st.rerun()
                else:
                    st.error("Invalid username or password.")
            else:
                user_id = create_user(username, password)
                if user_id:
                    st.session_state.user_id = user_id
                    st.success("Account created successfully!")
                    st.rerun()
                else:
                    st.error("That username already exists.")

def main():
    init_session_state()
    
    if st.session_state.user_id is None:
        show_auth()
        return
    
    if st.session_state.page == "get_started":
        show_get_started()
    elif st.session_state.page == "home":
        show_home()
    elif st.session_state.page == "lesson_loading":
        show_lesson_loading()
    elif st.session_state.page == "vocab_intro":
        show_vocab_intro()
    elif st.session_state.page == "lesson_interactive":
        show_lesson_interactive()
    elif st.session_state.page == "chat":
        show_chat()
    elif st.session_state.page == "results":
        show_results()
    elif st.session_state.page == "cheat_sheet_options":
        show_cheat_sheet_options()
    elif st.session_state.page == "reading_loading":
        show_reading_loading()
    elif st.session_state.page == "reading_view":
        show_reading_view()
    elif st.session_state.page == "roadmap_loading":
        show_roadmap_loading()
    elif st.session_state.page == "roadmap_view":
        show_roadmap_view()

if __name__ == "__main__":
    main()
