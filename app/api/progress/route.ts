import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    let progress = await prisma.progress.findUnique({ where: { userId } });
    if (!progress) {
      progress = await prisma.progress.create({
        data: { userId, xp: 0, streak: 0, level: 1 }
      });
    }
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

    const current = await prisma.progress.findUnique({ where: { userId } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newXp = current.xp + xpGained;
    const newLevel = Math.max(1, Math.floor(newXp / 50));

    // Naive streak update for demonstration (Streamlit just adds 1 sometimes or assumes 1)
    // We'll increment streak by 1 if updating
    const progress = await prisma.progress.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
        streak: current.streak === 0 ? 1 : current.streak, // Simplified streak logic
        completedLessons: { increment: 1 }
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ error: "Db error" }, { status: 500 });
  }
}
