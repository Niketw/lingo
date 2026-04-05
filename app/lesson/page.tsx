"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { useLessonStore } from "@/lib/lesson-store";
import { Button } from "@/components/ui/button";

export default function LessonLoadingPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const store = useUserStore();
  const { setLessonData, reset } = useLessonStore();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!store.userId) router.replace("/");
    setMounted(true);
    reset();

    const fetchLesson = async () => {
      try {
        const res = await fetch("/api/lesson/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceLang: store.sourceLang,
            targetLang: store.targetLang,
            topic: store.selectedTopic,
            level: "beginner"
          })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);

        setLessonData(data);
        router.push("/lesson/vocab");
      } catch (err: any) {
        setError(err.message || 1);
      }
    };

    fetchLesson();
  }, [store.userId, store.sourceLang, store.targetLang, store.selectedTopic, router, setLessonData, reset]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center pt-20 h-[60vh]">
      <h1 className="text-4xl font-extrabold mb-4 text-center animate-pulse">Generating your lesson...</h1>
      <p className="text-xl text-gray-300 font-bold mb-12">Focus: <span className="text-primary">{store.selectedTopic}</span></p>
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      
      {error && (
        <div className="mt-8 text-center text-danger font-bold">
          Error: {error}
          <div className="mt-4">
            <Button variant="secondary" onClick={() => router.push("/home")}>Back to Home</Button>
          </div>
        </div>
      )}
    </div>
  );
}
