import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { hashPassword } from "@/utils/auth";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    // Find the latest OTP for this email
    const latestReset = await prisma.passwordReset.findFirst({
      where: {
        email,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestReset) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Delete used OTPs for this email
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    logger.info(`Password successfully reset for: ${email}`);

    return NextResponse.json({
      message: "Password has been successfully reset.",
    });
  } catch (error) {
    logger.error("Error in password reset verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
