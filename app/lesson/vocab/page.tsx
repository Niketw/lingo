"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { useLessonStore } from "@/lib/lesson-store";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

export default function VocabIntroPage() {
  const router = useRouter();
  const store = useUserStore();
  const { lessonData } = useLessonStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!store.userId) router.replace("/");
    if (!lessonData) router.replace("/lesson");
    setMounted(true);
  }, [store.userId, lessonData, router]);

  if (!mounted || !lessonData) return null;

  const playAudio = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    
    // Cancel any ongoing speech to prevent queuing lag
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Comprehensive list of languages supported by SpeechSynthesis APIs
    const langMap: Record<string, string> = {
      English: "en-US", Spanish: "es-ES", French: "fr-FR", German: "de-DE", 
      Japanese: "ja-JP", Korean: "ko-KR", Italian: "it-IT", 
      Hindi: "hi-IN", Marathi: "mr-IN", Tamil: "ta-IN", Bengali: "bn-IN", 
      Gujarati: "gu-IN", Telugu: "te-IN", Kannada: "kn-IN", Malayalam: "ml-IN",
      Chinese: "zh-CN", Mandarin: "zh-CN", Russian: "ru-RU", Portuguese: "pt-BR", 
      Arabic: "ar-SA", Dutch: "nl-NL", Polish: "pl-PL", Turkish: "tr-TR", 
      Swedish: "sv-SE", Indonesian: "id-ID", Vietnamese: "vi-VN",
      Thai: "th-TH", Greek: "el-GR", Hebrew: "he-IL",
      Danish: "da-DK", Finnish: "da-DK"
    };

    const targetLangCode = langMap[store.targetLang] || "";
    if (targetLangCode) {
      utterance.lang = targetLangCode;
    }

    // Load available voices and try to match the exact language code
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && targetLangCode) {
      const matchedVoice = voices.find(voice => voice.lang === targetLangCode) 
        || voices.find(voice => voice.lang.startsWith(targetLangCode.split('-')[0]));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  };

  const vocab = lessonData.vocabulary || [];

  return (
    <div className="pt-8">
      <h1 className="text-3xl font-extrabold mb-2">📖 New Words</h1>
      <p className="text-xl font-bold text-gray-400 mb-8">Learn these words to ace the exercises!</p>

      {vocab.length === 0 ? (
        <div className="bg-card p-6 rounded-2xl border-2 border-border mb-8 text-center">
          <p className="text-xl text-[#1CB0F6] font-bold">Let's jump straight into practice!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 mb-8">
          {vocab.map((item: any, idx: number) => (
            <div key={idx} className="bg-card p-6 py-4 rounded-2xl border-2 border-border flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold mb-1">{item.word}</h3>
                <p className="text-[#AFAFAF] font-bold text-lg mb-1">{item.translation}</p>
                {item.pronunciation && <p className="text-gray-500 italic">/{item.pronunciation}/</p>}
              </div>
              <button 
                className="p-3 bg-[#131F24] border-2 border-border border-b-4 rounded-xl text-primary hover:bg-[#202F36] active:translate-y-1 active:border-b-2 transition-all"
                onClick={() => playAudio(item.word)}
              >
                <Volume2 size={28} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => router.push("/home")}>Back to Home</Button>
        <Button variant="default" onClick={() => router.push("/lesson/interactive")}>Start Exercises 💪</Button>
      </div>
    </div>
  );
}
