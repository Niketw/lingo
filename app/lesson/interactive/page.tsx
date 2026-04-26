"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { useLessonStore } from "@/lib/lesson-store";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

export default function InteractiveLessonPage() {
  const router = useRouter();
  const store = useUserStore();
  const { lessonData, currentIdx, correctCount, showFeedback, feedbackData, setFeedback, clearFeedback, incrementCorrect, nextQuestion, reset } = useLessonStore();
  
  const [mounted, setMounted] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (!store.userId) router.replace("/");
    if (!lessonData) router.replace("/lesson");
    setMounted(true);
  }, [store.userId, lessonData, router]);

  const questions = lessonData?.questions || [];
  const totalQ = questions.length;

  useEffect(() => {
    if (mounted && totalQ > 0 && currentIdx >= totalQ) {
      router.replace("/lesson/results");
    }
  }, [currentIdx, totalQ, mounted, router]);

  if (!mounted || !lessonData) return null;

  if (currentIdx >= totalQ && totalQ > 0) {
    return null;
  }

  const q = questions[currentIdx];
  const qType = q.type || "translation";
  const progress = currentIdx / totalQ;

  const handleCheck = async () => {
    if (!userAnswer) return;
    setEvaluating(true);
    
    try {
      const res = await fetch("/api/lesson/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          userAnswer,
          sourceLang: store.sourceLang,
          targetLang: store.targetLang
        })
      });
      const data = await res.json();
      
      setFeedback(data);
      if (data.correct) incrementCorrect();
    } catch (e) {
      console.error(e);
      setFeedback({ correct: false, feedback: "Error evaluating answer." });
    }
    setEvaluating(false);
  };

  const handleContinue = () => {
    clearFeedback();
    setUserAnswer("");
    nextQuestion();
  };

  const playAudio = async (text: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    
    const langMap: Record<string, string> = {
      English: "en", Spanish: "es", French: "fr", German: "de", 
      Japanese: "ja", Korean: "ko", Italian: "it", 
      Hindi: "hi", Marathi: "mr", Tamil: "ta", Bengali: "bn", 
      Gujarati: "gu", Telugu: "te", Kannada: "kn", Malayalam: "ml",
      Chinese: "zh-CN", Mandarin: "zh-CN", Russian: "ru", Portuguese: "pt", 
      Arabic: "ar", Dutch: "nl", Polish: "pl", Turkish: "tr", 
      Swedish: "sv", Indonesian: "id", Vietnamese: "vi",
      Thai: "th", Greek: "el", Hebrew: "he",
      Danish: "da", Finnish: "fi"
    };
    const langCode = langMap[store.targetLang] || "en";

    try {
      const res = await fetch("/api/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: langCode })
      });
      if (res.ok) {
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsPlayingAudio(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.play();
      } else {
        setIsPlayingAudio(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="pt-4 h-[90vh] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button className="text-gray-400 font-extrabold hover:text-white" onClick={() => router.push("/home")}>❌</button>
        <div className="flex-1"><ProgressBar progress={progress} /></div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-4xl font-extrabold m-0">{q.question}</h2>
          <button 
            onClick={() => playAudio(q.question)}
            className={`p-2 px-3 bg-[#1CB0F6] hover:bg-[#1899D6] active:bg-[#147eb1] rounded-xl text-white font-bold transition-all border-b-4 border-[#1899D6] active:border-b-0 active:translate-y-1 ${isPlayingAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Play Audio"
            disabled={isPlayingAudio}
          >
            {isPlayingAudio ? '⏳' : '🔊'}
          </button>
        </div>
        
        {!showFeedback ? (
          <div className="flex flex-col gap-4">
            {qType === "mcq" ? (
              q.options.map((opt: string, i: number) => (
                <label key={i} className={`
                  flex items-center p-4 rounded-2xl border-2 border-border border-b-4 font-bold text-lg cursor-pointer transition-all
                  ${userAnswer === opt ? "border-tertiary bg-cardHover text-tertiary" : "bg-card text-white hover:bg-cardHover hover:border-gray-500"}
                `}>
                  <input type="radio" value={opt} checked={userAnswer === opt} onChange={() => setUserAnswer(opt)} className="hidden" />
                  <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 text-sm bg-[#131F24] border-border">{i+1}</span>
                  {opt}
                </label>
              ))
            ) : (
              <input
                className="w-full bg-card text-white px-4 py-4 rounded-2xl border-2 border-border font-bold focus:border-tertiary focus:outline-none transition-colors"
                type="text"
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {qType === "mcq" ? (
              <div className="p-4 rounded-2xl border-2 border-gray-600 border-b-4 font-bold text-lg opacity-60">
                {userAnswer}
              </div>
            ) : (
              <input
                className="w-full bg-card text-white px-4 py-4 rounded-2xl border-2 border-border font-bold opacity-60"
                type="text"
                value={userAnswer}
                disabled
              />
            )}
            
            <div className={`mt-8 p-6 rounded-2xl border-2 ${feedbackData?.correct ? 'bg-[#202F36] border-[#58CC02]' : 'bg-[#311C20] border-[#EA2B2B]'}`}>
              <h2 className={`text-2xl font-extrabold mb-2 ${feedbackData?.correct ? "text-[#58CC02]" : "text-[#EA2B2B]"} `}>
                {feedbackData?.correct ? "✅ You're correct!" : "❌ Incorrect"}
              </h2>
              <p className={`text-xl font-bold ${feedbackData?.correct ? "text-[#58CC02]" : "text-[#EA2B2B]"}`}>
                {feedbackData?.feedback}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-8 flex border-t-2 border-border">
        {!showFeedback ? (
          <Button variant={userAnswer ? "default" : "secondary"} onClick={handleCheck} disabled={!userAnswer || evaluating} className="h-14">
            {evaluating ? "CHECKING..." : "CHECK"}
          </Button>
        ) : (
          <Button variant={feedbackData?.correct ? "default" : "danger"} onClick={handleContinue} className="h-14">
            CONTINUE
          </Button>
        )}
      </div>
    </div>
  );
}
