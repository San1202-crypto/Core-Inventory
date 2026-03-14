import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@test.com";
  const password = "adminpassword123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "admin", password: hashedPassword },
    });
    console.log(`✅ Updated existing user ${email} to Admin role.`);
  } else {
    await prisma.user.create({
      data: {
        email,
        name: "System Admin",
        username: "admin",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      },
    });
    console.log(`✅ Created new Admin account: ${email}`);
  }

  console.log(`\nAdmin Credentials:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
