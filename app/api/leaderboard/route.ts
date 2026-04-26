import { NextResponse } from 'next/server';
import { ProgressService } from "@/lib/services/progress-service";
import { PrismaProgressRepositoryAdapter } from "@/lib/adapters/prisma-progress-repository-adapter";

const progressRepository = new PrismaProgressRepositoryAdapter();
const progressService = new ProgressService(progressRepository);

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    
    const leaderboard = await progressService.getLeaderboard(limit);
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}