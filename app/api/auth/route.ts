import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { username, password, action } = await req.json();

    if (action === "register") {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      if (existingUser) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          passwordHash,
          progress: {
            create: {
              xp: 0,
              level: 1,
              streak: 0,
            }
          }
        }
      });
      return NextResponse.json({ id: user.id, username: user.username });
    } else if (action === "login") {
      const user = await prisma.user.findUnique({
        where: { username }
      });
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      return NextResponse.json({ id: user.id, username: user.username });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
