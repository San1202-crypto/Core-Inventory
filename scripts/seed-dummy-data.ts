import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding comprehensive dummy data...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      email: "admin@test.com",
      name: "Admin User",
      role: "admin",
      password: adminPassword,
      username: "admin",
      createdAt: new Date(),
    },
  });
  console.log(`✅ Ensured user: ${admin.email}`);

  // 2. Create Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { code: "WH-CENTRAL" },
    update: {},
    create: {
      name: "Central Warehouse",
      code: "WH-CENTRAL",
      location: "123 Main St, Tech City",
      description: "Main storage facility",
      isActive: true,
      userId: admin.id,
      createdBy: admin.id,
      createdAt: new Date(),
    },
  });
  console.log(`✅ Ensured warehouse: ${warehouse.name}`);

  // 3. Create Category
  const category = await prisma.category.create({
    data: {
      name: "Electronics & Gadgets",
      description: "Mobile phones, laptops, and accessories",
      status: true,
      userId: admin.id,
      createdBy: admin.id,
      createdAt: new Date(),
    },
  });
  console.log(`✅ Created category: ${category.name}`);

  // 4. Create Supplier
  const supplier = await prisma.supplier.create({
    data: {
      name: "Global Tech Supplies",
      status: true,
      userId: admin.id,
      createdBy: admin.id,
      createdAt: new Date(),
    },
  });
  console.log(`✅ Created supplier: ${supplier.name}`);

  // 5. Create Product
  const product = await prisma.product.create({
    data: {
      name: "Smartphone Pro Max",
      sku: "PHONE-PROMAX-001",
      price: 999.99,
      quantity: 150,
      reservedQuantity: 0,
      status: "Available",
      categoryId: category.id,
      supplierId: supplier.id,
      userId: admin.id,
      createdBy: admin.id,
      unitOfMeasure: "unit",
      createdAt: new Date(),
    },
  });
  console.log(`✅ Created product: ${product.name}`);

  // 6. Create initial Stock in Warehouse
  const stock = await prisma.stock.create({
    data: {
      productId: product.id,
      warehouseId: warehouse.id,
      quantity: 150,
      reservedQuantity: 0,
      userId: admin.id,
      createdAt: new Date(),
    },
  });
  console.log(`✅ Allocated stock to warehouse: ${warehouse.name}`);

  console.log("✨ Seeding complete!");
  console.log("Login with email: admin@test.com / password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
