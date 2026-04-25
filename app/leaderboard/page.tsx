import { ProgressService } from "@/lib/services/progress-service";
import { PrismaProgressRepositoryAdapter } from "@/lib/adapters/prisma-progress-repository-adapter";
import { Trophy, Flame, Star } from "lucide-react";

const progressRepository = new PrismaProgressRepositoryAdapter();
const progressService = new ProgressService(progressRepository);

export default async function LeaderboardPage() {
  const leaderboard = await progressService.getLeaderboard(50);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4 border-b pb-4">
        <Trophy className="h-10 w-10 text-yellow-500" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 gap-4 p-4 font-semibold text-muted-foreground bg-muted/50 border-b text-sm sm:text-base">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 sm:col-span-6">User</div>
          <div className="col-span-3 sm:col-span-2 text-center">XP</div>
          <div className="col-span-3 sm:col-span-3 text-center">Streak</div>
        </div>
        
        <div className="divide-y">
          {leaderboard.map((entry, index) => {
            const isTop3 = index < 3;
            return (
              <div 
                key={entry.userId} 
                className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors hover:bg-muted/30 ${
                  index === 0 ? "bg-yellow-500/10" : 
                  index === 1 ? "bg-slate-300/20" : 
                  index === 2 ? "bg-amber-700/10" : ""
                }`}
              >
                <div className="col-span-1 text-center font-bold text-lg">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                </div>
                
                <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold
                    ${isTop3 ? "bg-primary" : "bg-muted-foreground"}`}
                  >
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold truncate">{entry.username}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3" /> Level {entry.level}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-3 sm:col-span-2 text-center font-bold text-primary">
                  {entry.xp} XP
                </div>
                
                <div className="col-span-3 sm:col-span-3 text-center flex items-center justify-center gap-1 font-medium">
                  {entry.streak > 0 ? (
                    <>
                      <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                      {entry.streak}
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            );
          })}
          
          {leaderboard.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No users found on the leaderboard yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}