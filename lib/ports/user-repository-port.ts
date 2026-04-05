export type UserRecord = {
  id: string;
  username: string;
  passwordHash: string;
};

export interface UserRepositoryPort {
  findByUsername(username: string): Promise<UserRecord | null>;
  createUserWithInitialProgress(params: {
    username: string;
    passwordHash: string;
  }): Promise<Pick<UserRecord, "id" | "username">>;
}
