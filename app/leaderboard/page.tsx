"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Flame, Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard?limit=50")
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 w-full">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button variant="secondary" size="icon" onClick={() => router.push("/home")} className="rounded-full h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Trophy className="h-10 w-10 text-yellow-500" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 font-semibold text-gray-400 bg-black/20 border-b border-border text-sm sm:text-base">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 sm:col-span-6">User</div>
          <div className="col-span-3 sm:col-span-2 text-center">XP</div>
          <div className="col-span-3 sm:col-span-3 text-center">Streak</div>
        </div>
        
        <div className="divide-y divide-border">
          {loading ? (
             <div className="p-8 text-center text-gray-400 animate-pulse font-bold">
               Loading Leaderboard...
             </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-bold">
              No users found on the leaderboard yet.
            </div>
          ) : leaderboard.map((entry, index) => {
            const isTop3 = index < 3;
            return (
              <div 
                key={entry.userId} 
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-cardHover ${
                  index === 0 ? "bg-[#58CC02]/10" : 
                  index === 1 ? "bg-gray-300/10" : 
                  index === 2 ? "bg-amber-700/10" : ""
                }`}
              >
                <div className="col-span-1 text-center font-bold text-lg">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </div>
                
                <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold
                    ${isTop3 ? "bg-primary" : "bg-gray-600"}`}
                  >
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold truncate">{entry.username}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-bold">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" /> Level {entry.level}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-3 sm:col-span-2 text-center font-extrabold text-primary">
                  {entry.xp} XP
                </div>
                
                <div className="col-span-3 sm:col-span-3 text-center flex items-center justify-center gap-1 font-bold">
                  {entry.streak > 0 ? (
                    <>
                      <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                      {entry.streak}
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}