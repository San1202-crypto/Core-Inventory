import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: NextRequest) {
  let mongoClient: MongoClient | null = null;
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Lazy import to avoid module-level blocking
    const { prisma } = await import("@/prisma/client");

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found - security: avoid email enumeration
      return NextResponse.json({
        message: "If an account exists, a reset code has been sent.",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP using native MongoDB driver to avoid Prisma's transaction
    // requirement that needs a MongoDB replica set
    mongoClient = new MongoClient(process.env.DATABASE_URL!, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    const db = mongoClient.db();
    await db.collection("PasswordReset").insertOne({
      email,
      otp,
      expiresAt,
      createdAt: new Date(),
    });
    await mongoClient.close();
    mongoClient = null;

    // Send email via Brevo (lazy import)
    try {
      const { generatePasswordResetEmail } = await import("@/lib/email/templates");
      const { sendEmailViaBrevo } = await import("@/lib/email/brevo");
      const emailContent = generatePasswordResetEmail(otp);
      const result = await sendEmailViaBrevo({
        to: { email: user.email, name: user.name },
        subject: emailContent.subject,
        htmlContent: emailContent.htmlContent,
        textContent: emailContent.textContent,
      });
      if (!result.success) {
        console.error("Failed to send OTP email:", result.error);
      }
    } catch (emailErr) {
      // Non-fatal: log but don't fail the request
      console.error("Email send error (non-fatal):", emailErr);
    }

    return NextResponse.json({
      message: "If an account exists, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (mongoClient) {
      try { await mongoClient.close(); } catch { /* ignore */ }
    }
  }
}
