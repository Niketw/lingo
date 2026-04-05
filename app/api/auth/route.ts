import { NextRequest, NextResponse } from "next/server";
import { passwordHasherAdapter } from "@/lib/adapters/bcrypt-password-hasher-adapter";
import { userRepositoryAdapter } from "@/lib/adapters/prisma-user-repository-adapter";
import { AuthService } from "@/lib/services/auth-service";

const authService = new AuthService(userRepositoryAdapter, passwordHasherAdapter);

export async function POST(req: NextRequest) {
  try {
    const { username, password, action } = await req.json();

    if (action === "register") {
      const result = await authService.register(username, password);
      if (!result.ok) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }

      return NextResponse.json(result.user);
    } else if (action === "login") {
      const result = await authService.login(username, password);
      if (!result.ok) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      return NextResponse.json(result.user);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
