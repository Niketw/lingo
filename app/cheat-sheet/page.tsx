"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function CheatSheetOptionsPage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const store = useUserStore();
  const [topic, setTopic] = useState("Travel");
  const [level, setLevel] = useState("Beginner");

  useEffect(() => {
    if (!store.userId) router.replace("/");
    setMounted(true);
  }, [store.userId, router]);

  if (!mounted) return null;

  return (
    <div className="pt-20 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold mb-4 text-center">📜 Cheat Sheet Generator</h1>
      <p className="text-gray-400 font-bold mb-8 text-center max-w-sm">Create a custom study guide for any topic in {store.targetLang}.</p>

      <div className="w-full max-w-md flex flex-col gap-6 bg-card p-6 rounded-2xl border-2 border-border mb-8 text-left">
        <div>
          <label className="font-bold block mb-2 text-lg text-white">Enter a topic:</label>
          <input
            className="w-full bg-background border-2 border-border text-white px-4 py-3 rounded-xl font-bold focus:border-[#1CB0F6] focus:outline-none transition-colors"
            placeholder="e.g. 'Coffee Shop', 'Business'"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>
        <div>
          <label className="font-bold block mb-2 text-lg text-white">Difficulty Level:</label>
          <select
            className="w-full bg-background border-2 border-border text-white px-4 py-3 rounded-xl font-bold focus:border-[#1CB0F6] focus:outline-none appearance-none"
            value={level}
            onChange={e => setLevel(e.target.value)}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 w-full justify-center max-w-md">
        <Button variant="secondary" onClick={() => router.push("/home")}>Back to Home</Button>
        <Button variant="default" onClick={() => router.push(`/cheat-sheet/view?topic=${encodeURIComponent(topic)}&level=${level}`)}>
          Generate ✨
        </Button>
      </div>
    </div>
  );
}
