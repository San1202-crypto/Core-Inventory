import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = [
    {
      email: "admin@test.com",
      name: "Admin User",
      role: "admin",
      password: "password123",
      username: "admin",
    },
    {
      email: "test@client.com",
      name: "Test Client",
      role: "client",
      password: "password123",
      username: "client",
    },
    {
      email: "supplier@tech.com",
      name: "Global Tech Supplies",
      role: "supplier",
      password: "password123",
      username: "supplier",
    },
  ];

  console.log("🌱 Seeding test users...");

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        password: hashedPassword,
        username: user.username,
        createdAt: new Date(),
      },
    });
    console.log(`✅ Created user: ${createdUser.email} (${createdUser.role})`);
  }

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
