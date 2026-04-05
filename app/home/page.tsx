"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState({ streak: 0, xp: 0, level: 1 });
  const store = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!store.userId) {
      router.replace("/");
      return;
    }
    setMounted(true);

    fetch(`/api/progress?userId=${store.userId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setProgress(data);
      })
      .catch(console.error);
  }, [store.userId, router]);

  if (!mounted) return null;

  const handleLogout = () => {
    store.logout();
    router.push("/");
  };

  const startLesson = (topic: string) => {
    store.setTopic(topic);
    router.push("/lesson");
  };

  const topics = [
    { display: "🔤 Letters & Alphabet", value: "Alphabet and Letters" },
    { display: "🔢 Numbers 1-20", value: "Numbers and Tracking" },
    { display: "👋 Basic Greetings", value: "Basic Greetings and Introductions" },
    { display: "✈️ Travel Essentials", value: "Travel and Navigation Phrases" },
    { display: "🍔 Food & Dining", value: "Food, Drink, and Ordering" },
    { display: "🎲 Random Practice", value: "General mixed practice" }
  ];

  return (
    <div className="pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold">Learn {store.targetLang}!</h1>
        <Button variant="secondary" size="lg" className="w-auto h-12" onClick={handleLogout}>Logout</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <MetricCard icon="🔥" value={progress.streak} label="Streak" />
        <MetricCard icon="⭐" value={progress.xp} label="XP" />
        <MetricCard icon="🎓" value={`Lv. ${progress.level}`} label="Level" />
      </div>

      <div className="w-full h-[2px] bg-border mb-6"></div>
      <h3 className="text-2xl font-bold mb-4">Choose your path</h3>

      <div className="flex flex-col gap-4 mb-8">
        {topics.map(t => (
          <Button key={t.display} variant="secondary" onClick={() => startLesson(t.value)}>
            {t.display}
          </Button>
        ))}
      </div>

      <div className="w-full h-[2px] bg-border mb-6"></div>
      <h3 className="text-2xl font-bold mb-4">🧠 AI Power Tools</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button variant="secondary" onClick={() => router.push("/roadmap")}>🗺️ Course Roadmap</Button>
        <Button variant="secondary" onClick={() => router.push("/cheat-sheet")}>📜 Cheat Sheets</Button>
      </div>

      <div className="w-full h-[2px] bg-border mb-6"></div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="default" onClick={() => router.push("/chat")}>💬 Chat Practice</Button>
        <Button variant="secondary" onClick={() => router.push("/onboarding")}>Change Language 🌍</Button>
      </div>
    </div>
  );
}
