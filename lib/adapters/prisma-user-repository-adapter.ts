import { prisma } from "@/lib/prisma";
import { UserRecord, UserRepositoryPort } from "@/lib/ports/user-repository-port";

export class PrismaUserRepositoryAdapter implements UserRepositoryPort {
  async findByUsername(username: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      passwordHash: user.passwordHash,
    };
  }

  async createUserWithInitialProgress(params: {
    username: string;
    passwordHash: string;
  }): Promise<Pick<UserRecord, "id" | "username">> {
    const user = await prisma.user.create({
      data: {
        username: params.username,
        passwordHash: params.passwordHash,
        progress: {
          create: {
            xp: 0,
            level: 1,
            streak: 0,
          },
        },
      },
    });

    return {
      id: user.id,
      username: user.username,
    };
  }
}

export const userRepositoryAdapter = new PrismaUserRepositoryAdapter();
