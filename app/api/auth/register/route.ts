/**
 * Register API Route Handler
 * App Router route handler for user registration
 * Refactored to use Prisma for consistency and reliability
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { prisma } from "@/prisma/client";

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod schema
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a unique username from email
    const baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    // Check for username collision (if your schema requires unique usernames)
    while (await prisma.user.findFirst({ where: { name: username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    // Create user (new signups get admin role for full manipulation power)
    const user = await prisma.user.create({
      data: {
        name: name || username,
        email,
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      },
    });

    const { invalidateAllServerCaches } = await import("@/lib/cache");
    await invalidateAllServerCaches().catch(() => {});

    logger.info(`New user registered: ${email}`);

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid registration data. Please check your inputs." },
        { status: 400 }
      );
    }

    logger.error("Registration error:", error);

    const message =
      error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json(
      { error: `Registration failed: ${message}` },
      { status: 500 }
    );
  }
}
