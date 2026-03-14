import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  let mongoClient: MongoClient | null = null;
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP, and new password are required" },
        { status: 400 }
      );
    }

    mongoClient = new MongoClient(process.env.DATABASE_URL!, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    const db = mongoClient.db();

    // Find latest valid OTP for this email using native MongoDB
    const resetRecord = await db.collection("PasswordReset").findOne(
      {
        email,
        otp,
        expiresAt: { $gt: new Date() },
      },
      { sort: { createdAt: -1 } }
    );

    if (!resetRecord) {
      await mongoClient.close();
      mongoClient = null;
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password using native MongoDB
    const updateResult = await db.collection("User").updateOne(
      { email },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      await mongoClient.close();
      mongoClient = null;
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete all OTPs for this email
    await db.collection("PasswordReset").deleteMany({ email });

    await mongoClient.close();
    mongoClient = null;

    return NextResponse.json({
      message: "Password has been successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error("Password reset verify error:", error);
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
