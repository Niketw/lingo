"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';

function CheatSheetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useUserStore();
  
  const [mounted, setMounted] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const topic = searchParams.get("topic") || "Travel";
  const level = searchParams.get("level") || "Beginner";

  useEffect(() => {
    if (!store.userId) router.replace("/");
    setMounted(true);

    const fetchCheatSheet = async () => {
      try {
        const res = await fetch("/api/cheat-sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            sourceLang: store.sourceLang,
            targetLang: store.targetLang,
            level
          })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);

        setContent(data.content);
      } catch (err: any) {
        setError(err.message || 1);
      }
      setLoading(false);
    };

    fetchCheatSheet();
  }, [store.userId, store.sourceLang, store.targetLang, topic, level, router]);

  if (!mounted) return null;

  return (
    <div className="pt-8 pb-12">
      {loading ? (
        <div className="flex flex-col items-center justify-center pt-20 h-[60vh]">
          <h1 className="text-4xl font-extrabold mb-4 text-center animate-pulse">Generating Cheat Sheet...</h1>
          <p className="text-xl text-gray-300 font-bold mb-12">Topic: <span className="text-primary">{topic}</span></p>
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
          <h1 className="text-4xl font-extrabold mb-8 text-[#1CB0F6]">📜 {topic}</h1>
          <div className="bg-card p-6 rounded-2xl border-2 border-border mb-8 prose prose-invert max-w-none text-lg">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => router.push("/cheat-sheet")}>New Topic 🔄</Button>
            <Button variant="default" onClick={() => router.push("/home")}>Home 🏠</Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CheatSheetViewPage() {
  return (
    <Suspense fallback={<div className="pt-8 pb-12 flex flex-col items-center justify-center h-[60vh]"><div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <CheatSheetContent />
    </Suspense>
  );
}
