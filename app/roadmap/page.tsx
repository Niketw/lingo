"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function RoadmapPage() {
  const router = useRouter();
  const store = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  useEffect(() => {
    if (!store.userId) router.replace("/");
    setMounted(true);

    const fetchRoadmap = async () => {
      try {
        const res = await fetch("/api/roadmap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceLang: store.sourceLang,
            targetLang: store.targetLang
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setRoadmap(data);
      } catch (err: any) {
        setError(err.message || 1);
      }
      setLoading(false);
    };

    fetchRoadmap();
  }, [store.userId, store.sourceLang, store.targetLang, router]);

  if (!mounted) return null;

  return (
    <div className="pt-8 pb-12">
      {loading ? (
        <div className="flex flex-col items-center justify-center pt-20 h-[60vh]">
          <h1 className="text-4xl font-extrabold mb-4 text-center animate-pulse">Designing your Course...</h1>
          <p className="text-xl text-gray-300 font-bold mb-12">Analyzing curriculum standards...</p>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center mt-20 text-danger font-bold">
          Error: {error}
          <div className="mt-8 flex gap-4 w-full justify-center max-w-md">
             <Button variant="secondary" onClick={() => router.push("/home")}>Back to Home</Button>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-extrabold mb-2 text-[#58CC02]">🗺️ Your Roadmap</h1>
          <h3 className="text-2xl font-bold mb-8 text-white">{roadmap.title}</h3>

          <div className="flex flex-col gap-4 mb-12">
            {roadmap.modules?.map((m: any) => (
              <div 
                key={m.week} 
                className="bg-card rounded-2xl border-2 border-border overflow-hidden transition-all"
              >
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center hover:bg-cardHover font-bold"
                  onClick={() => setExpandedWeek(expandedWeek === m.week ? null : m.week)}
                >
                  <span className="text-xl">Week {m.week}: {m.topic}</span>
                  <span className="text-gray-400">{expandedWeek === m.week ? '▼' : '▶'}</span>
                </div>
                
                {expandedWeek === m.week && (
                  <div className="p-4 border-t-2 border-border bg-[#1A252A]">
                    <div className="mb-4 text-gray-300 font-bold prose prose-invert max-w-none">
                      <ReactMarkdown>{m.description}</ReactMarkdown>
                    </div>
                    <h4 className="font-extrabold mb-2 text-[#1CB0F6]">Daily Plan:</h4>
                    <ul className="list-disc pl-6 mb-6 space-y-2 font-bold text-gray-300 text-sm">
                      {m.daily_breakdown.map((d: string, i: number) => (
                        <li key={i}>
                          <div className="prose prose-invert max-w-none"><ReactMarkdown>{d}</ReactMarkdown></div>
                        </li>
                      ))}
                    </ul>

                    <div className="w-full h-[2px] bg-border mb-4"></div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="default" onClick={() => { store.setTopic(m.topic); router.push("/lesson"); }}>Start Lesson</Button>
                      <Button variant="secondary" onClick={() => { router.push(`/cheat-sheet/view?topic=${encodeURIComponent(m.topic)}&level=Beginner`); }}>Resources</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Button variant="secondary" size="lg" onClick={() => router.push("/home")}>Back to Home 🏠</Button>
        </>
      )}
    </div>
  );
}
