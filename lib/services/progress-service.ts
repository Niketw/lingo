import {
  ProgressRecord,
  ProgressRepositoryPort,
} from "@/lib/ports/progress-repository-port";

export class ProgressService {
  constructor(private readonly progressRepository: ProgressRepositoryPort) {}

  async getOrCreate(userId: string): Promise<ProgressRecord> {
    const existing = await this.progressRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }

    return this.progressRepository.createInitialForUser(userId);
  }

  async addLessonXP(params: { userId: string; xpGained: number }) {
    return this.progressRepository.updateAfterLesson(params);
  }
}
