import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { generatePasswordResetEmail } from "@/lib/email/templates";
import { sendEmailViaBrevo } from "@/lib/email/brevo";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      // Return success even if user not found for security reasons (avoid enum)
      return NextResponse.json({
        message: "If an account exists, a reset code has been sent.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in DB
    await prisma.passwordReset.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send email
    const emailContent = generatePasswordResetEmail(otp);
    const result = await sendEmailViaBrevo({
      to: { email: user.email, name: user.name },
      subject: emailContent.subject,
      htmlContent: emailContent.htmlContent,
      textContent: emailContent.textContent,
    });

    if (!result.success) {
      logger.error(`Failed to send password reset email to ${email}: ${result.error}`);
      // Special internal error for debugging
      console.error("EMAIL_SEND_FAILED:", result.error);
    } else {
      logger.info(`Password reset OTP sent successfully to: ${email}`);
    }

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    logger.error("Error in password reset request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
