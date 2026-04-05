"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const store = useUserStore();
  const [mounted, setMounted] = useState(false);

  const sourceOptions = ["English", "Hindi", "Marathi", "Tamil", "Bengali", "Gujarati", "Telugu", "Kannada", "Malayalam"];
  const targetOptions = ["Spanish", "French", "German", "English", "Japanese", "Korean", "Italian"];

  useEffect(() => {
    if (!store.userId) router.replace("/");
    setMounted(true);
  }, [store.userId, router]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="text-3xl font-extrabold text-center mb-2">🌍 Welcome to Language Buddy</h1>
      <p className="text-xl font-bold text-gray-400 mb-8 text-center">Learn a language for free. Forever.</p>

      <div className="w-full h-[2px] bg-border mb-8"></div>

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-bold text-lg">I speak:</label>
          <select 
            className="w-full appearance-none bg-card text-white px-4 py-4 rounded-2xl border-2 border-border font-bold focus:border-tertiary focus:outline-none"
            value={store.sourceLang}
            onChange={(e) => store.setLanguages(e.target.value, store.targetLang)}
          >
            {sourceOptions.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-bold text-lg">I want to learn:</label>
          <select 
            className="w-full appearance-none bg-card text-white px-4 py-4 rounded-2xl border-2 border-border font-bold focus:border-tertiary focus:outline-none"
            value={store.targetLang}
            onChange={(e) => store.setLanguages(store.sourceLang, e.target.value)}
          >
            {targetOptions.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-full h-[2px] bg-border my-8"></div>

      <div className="flex gap-4 w-full justify-center">
        <Button variant="secondary" onClick={() => router.push("/home")}>
          Back to Home
        </Button>
        <Button variant="default" onClick={() => router.push("/home")}>
          Get Started!
        </Button>
      </div>
    </div>
  );
}
