import { prisma } from "@/lib/prisma";
import {
  ProgressRecord,
  ProgressRepositoryPort,
  LeaderboardEntry,
} from "@/lib/ports/progress-repository-port";

export class PrismaProgressRepositoryAdapter implements ProgressRepositoryPort {
  async findByUserId(userId: string): Promise<ProgressRecord | null> {
    const progress = await prisma.progress.findUnique({
      where: { userId },
    });

    if (!progress) {
      return null;
    }

    return progress;
  }

  async createInitialForUser(userId: string): Promise<ProgressRecord> {
    const progress = await prisma.progress.create({
      data: { userId, xp: 0, streak: 0, level: 1 },
    });

    return progress;
  }

  async updateAfterLesson(params: {
    userId: string;
    xpGained: number;
  }): Promise<ProgressRecord> {
    const current = await prisma.progress.findUnique({
      where: { userId: params.userId },
    });

    if (!current) {
      throw new Error("PROGRESS_NOT_FOUND");
    }

    const newXp = current.xp + params.xpGained;
    const newLevel = Math.max(1, Math.floor(newXp / 50));

    const progress = await prisma.progress.update({
      where: { userId: params.userId },
      data: {
        xp: newXp,
        level: newLevel,
        streak: current.streak === 0 ? 1 : current.streak,
        completedLessons: { increment: 1 },
      },
    });

    return progress;
  }

  async getTopUsers(limit: number): Promise<LeaderboardEntry[]> {
    const records = await prisma.progress.findMany({
      take: limit,
      orderBy: { xp: "desc" },
      include: { user: true },
    });

    return records.map((record) => ({
      userId: record.userId,
      username: record.user.username,
      xp: record.xp,
      level: record.level,
      streak: record.streak,
    }));
  }
}

export const progressRepositoryAdapter = new PrismaProgressRepositoryAdapter();
