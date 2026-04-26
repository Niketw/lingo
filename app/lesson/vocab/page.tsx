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
  const [isPlayingAudioMap, setIsPlayingAudioMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!store.userId) router.replace("/");
    if (!lessonData) router.replace("/lesson");
    setMounted(true);
  }, [store.userId, lessonData, router]);

  if (!mounted || !lessonData) return null;

  const playAudio = async (text: string, idx: number) => {
    if (isPlayingAudioMap[idx]) return;
    setIsPlayingAudioMap(prev => ({ ...prev, [idx]: true }));
    
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
          setIsPlayingAudioMap(prev => ({ ...prev, [idx]: false }));
          URL.revokeObjectURL(audioUrl);
        };
        audio.play();
      } else {
        setIsPlayingAudioMap(prev => ({ ...prev, [idx]: false }));
      }
    } catch (e) {
      console.error(e);
      setIsPlayingAudioMap(prev => ({ ...prev, [idx]: false }));
    }
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
                className={`p-3 bg-[#131F24] border-2 border-border border-b-4 rounded-xl text-primary hover:bg-[#202F36] active:translate-y-1 active:border-b-2 transition-all ${isPlayingAudioMap[idx] ? 'opacity-50 cursor-not-allowed text-gray-500' : ''}`}
                onClick={() => playAudio(item.word, idx)}
                disabled={isPlayingAudioMap[idx]}
              >
                {isPlayingAudioMap[idx] ? <span className="text-xl">⏳</span> : <Volume2 size={28} />}
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
