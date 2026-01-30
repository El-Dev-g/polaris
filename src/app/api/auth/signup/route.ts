import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY!;

    // Check if user already exists
    const existingUser = await convex.query(api.system.getUserByEmail, {
      internalKey,
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await convex.mutation(api.system.createUser, {
      internalKey,
      email,
      password: hashedPassword,
      name: name || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
