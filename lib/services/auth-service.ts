import { PasswordHasherPort } from "@/lib/ports/password-hasher-port";
import { UserRepositoryPort } from "@/lib/ports/user-repository-port";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async register(username: string, password: string) {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      return { ok: false as const, error: "Username already exists" };
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = await this.userRepository.createUserWithInitialProgress({
      username,
      passwordHash,
    });

    return { ok: true as const, user };
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return { ok: false as const, error: "Invalid credentials" };
    }

    const isValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!isValid) {
      return { ok: false as const, error: "Invalid credentials" };
    }

    return {
      ok: true as const,
      user: { id: user.id, username: user.username },
    };
  }
}
