import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🔍 Testing MongoDB connection...");
    const userCount = await prisma.user.count();
    console.log(`✅ Success! Connected to MongoDB. Found ${userCount} users.`);
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
