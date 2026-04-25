export type ProgressRecord = {
  id: string;
  userId: string;
  xp: number;
  level: number;
  streak: number;
  completedLessons: number;
};

export type LeaderboardEntry = {
  userId: string;
  username: string;
  xp: number;
  level: number;
  streak: number;
};

export interface ProgressRepositoryPort {
  findByUserId(userId: string): Promise<ProgressRecord | null>;
  createInitialForUser(userId: string): Promise<ProgressRecord>;
  updateAfterLesson(params: {
    userId: string;
    xpGained: number;
  }): Promise<ProgressRecord>;
  getTopUsers(limit: number): Promise<LeaderboardEntry[]>;
}
