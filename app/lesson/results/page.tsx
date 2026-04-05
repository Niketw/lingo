"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { useLessonStore } from "@/lib/lesson-store";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import JSConfetti from "js-confetti";

export default function LessonResultsPage() {
  const router = useRouter();
  const store = useUserStore();
  const { lessonData, correctCount, reset } = useLessonStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!store.userId) router.replace("/");
    if (!lessonData) router.replace("/home");
    setMounted(true);
    
    if (typeof window !== "undefined") {
      const jsConfetti = new JSConfetti();
      jsConfetti.addConfetti({ emojis: ['🎉', '⚡', '🌟', '🚀'] });
    }

    const totalQ = lessonData?.questions?.length || 0;
    const xpGained = correctCount * 10;

    if (store.userId && xpGained > 0) {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: store.userId, xpGained })
      }).catch(console.error);
    }

  }, [store.userId, lessonData, router, correctCount]);

  if (!mounted || !lessonData) return null;

  const totalQ = lessonData.questions?.length || 0;
  const score = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;
  const xpGained = correctCount * 10;

  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <h1 className="text-4xl font-extrabold mb-12 text-[#FFC800]">🎉 Lesson Completed!</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-20 w-full">
        <MetricCard icon="🎯" value={`${score}%`} label="Score" className="border-[#FFC800] bg-[#4B3B0A]" />
        <MetricCard icon="⭐" value={`+${xpGained}`} label="XP Gained" className="border-[#1CB0F6] bg-[#0A3D5D]" />
      </div>

      <div className="w-full mt-auto">
        <Button variant="default" size="lg" onClick={() => { reset(); router.push("/home"); }}>
          CONTINUE
        </Button>
      </div>
    </div>
  );
}
