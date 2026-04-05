"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { useChat } from 'ai/react';
import { Button } from "@/components/ui/button";
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const router = useRouter();
  const store = useUserStore();
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: { targetLang: store.targetLang }
  });

  useEffect(() => {
    if (!store.userId) router.replace("/");
    setMounted(true);
  }, [store.userId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-screen pt-4 pb-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold text-[#1CB0F6]">💬 Chat Practice</h1>
        <Button variant="secondary" size="sm" className="w-auto h-10 px-4" onClick={() => router.push("/home")}>🏠 Home</Button>
      </div>
      <p className="text-gray-400 font-bold mb-4">Practice your {store.targetLang} skills with our AI tutor!</p>

      <div className="flex-1 overflow-y-auto bg-card rounded-2xl border-2 border-border p-4 mb-4 flex flex-col gap-4 relative">
        {messages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 font-bold opacity-50 text-center px-8 text-xl">
            Say something in {store.targetLang} to get started!
          </div>
        )}
        
        {messages.map(m => (
          <div key={m.id} className={`max-w-[80%] p-4 rounded-2xl font-bold flex flex-col ${m.role === 'user' ? 'bg-[#1CB0F6] text-[#131F24] self-end rounded-tr-sm' : 'bg-[#37464F] text-white self-start rounded-tl-sm border-2 border-transparent'}`}>
            <span className="text-xs opacity-70 mb-1">{m.role === 'user' ? 'You' : 'Language Buddy'}</span>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          className="flex-1 bg-card text-white px-4 py-4 rounded-2xl border-2 border-border font-bold focus:border-[#1CB0F6] focus:outline-none transition-colors"
          placeholder={`Say something in ${store.targetLang}...`}
        />
        <Button type="submit" className="w-auto px-6 bg-[#1CB0F6] border-b-4 border-[#1899D6] hover:bg-[#1899D6]">SEND</Button>
      </form>
    </div>
  );
}
