import { NextRequest, NextResponse } from "next/server";
import { progressRepositoryAdapter } from "@/lib/adapters/prisma-progress-repository-adapter";
import { ProgressService } from "@/lib/services/progress-service";

const progressService = new ProgressService(progressRepositoryAdapter);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    const progress = await progressService.getOrCreate(userId);
    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: "Db error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, xpGained } = await req.json();
    if (!userId || typeof xpGained !== 'number') {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const progress = await progressService.addLessonXP({ userId, xpGained });

    return NextResponse.json(progress);
  } catch (error) {
    if (error instanceof Error && error.message === "PROGRESS_NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Db error" }, { status: 500 });
  }
}
