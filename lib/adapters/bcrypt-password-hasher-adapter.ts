import bcrypt from "bcrypt";

import { PasswordHasherPort } from "@/lib/ports/password-hasher-port";

export class BcryptPasswordHasherAdapter implements PasswordHasherPort {
  constructor(private readonly rounds: number = 10) {}

  hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.rounds);
  }

  compare(plainText: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }
}

export const passwordHasherAdapter = new BcryptPasswordHasherAdapter();
