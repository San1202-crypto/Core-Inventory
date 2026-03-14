import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const uid = () => crypto.randomBytes(4).toString("hex").toUpperCase();

async function main() {
  console.log("🌱 Seeding advanced collection data...");

  // Get some reference data
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  const client = await prisma.user.findFirst({ where: { role: "client" } });
  const product = await prisma.product.findFirst();
  const order = await prisma.order.findFirst();
  const warehouse = await prisma.warehouse.findFirst();
  
  if (!admin || !client || !product || !order || !warehouse) {
      console.log("Missing base resources. Please run seed-presentation-data script first.");
      return;
  }

  // Department
  await prisma.department.create({});
  console.log("✅ Seeded Department");

  // ImportHistory
  await prisma.importHistory.create({
      data: {
          userId: admin.id,
          importType: "products",
          fileName: "initial_catalog_load.csv",
          fileSize: 15420,
          totalRows: 150,
          successRows: 150,
          failedRows: 0,
          status: "completed",
          createdAt: new Date(Date.now() - 5 * 86400000),
          completedAt: new Date(Date.now() - 5 * 86400000),
      }
  });
  console.log("✅ Seeded ImportHistory");

  // Notification
  await prisma.notification.create({
      data: {
          userId: admin.id,
          type: "low_stock",
          title: "Low Stock Alert",
          message: `Product ${product.name} is running low on stock.`,
          link: `/admin/products/${product.id}`,
          read: false,
          createdAt: new Date(),
      }
  });
  console.log("✅ Seeded Notification");

  // PasswordReset
  await prisma.passwordReset.create({
      data: {
          email: "test@client.com",
          otp: "123456",
          expiresAt: new Date(Date.now() + 3600000),
          createdAt: new Date(),
      }
  });
  console.log("✅ Seeded PasswordReset");

  // Permission
  await prisma.permission.create({
      data: {
          userId: { id: admin.id },
          resource: { access: "all" }
      }
  });
  console.log("✅ Seeded Permission");

  // ProductReview
  await prisma.productReview.create({
      data: {
          productId: product.id,
          userId: client.id,
          orderId: order.id,
          productName: product.name,
          rating: 5,
          comment: "Excellent product, arrived on time and works as expected!",
          status: "approved",
          createdAt: new Date(Date.now() - 2 * 86400000),
      }
  });
  console.log("✅ Seeded ProductReview");

  // Session
  await prisma.session.create({
      data: {
          sessionToken: { token: `sess_${uid()}` }
      }
  });
  console.log("✅ Seeded Session");

  // StockAlert
  await prisma.stockAlert.create({});
  console.log("✅ Seeded StockAlert");

  // StockTransfer
  await prisma.stockTransfer.create({
      data: {
          productId: product.id,
          fromWarehouseId: warehouse.id,
          toWarehouseId: warehouse.id, // For demo purposes
          quantity: 20,
          status: "completed",
          notes: "Routine redistribution",
          userId: admin.id,
          createdAt: new Date(Date.now() - 3 * 86400000),
          completedAt: new Date(Date.now() - 2 * 86400000),
      }
  });
  console.log("✅ Seeded StockTransfer");

  // SupportTicket & Reply
  const ticket = await prisma.supportTicket.create({
      data: {
          subject: "Issue with recent delivery",
          description: "One of the items in my order was damaged during transit.",
          status: "in_progress",
          priority: "high",
          userId: client.id,
          orderId: order.id,
          createdAt: new Date(Date.now() - 4 * 86400000),
      }
  });
  
  await prisma.supportTicketReply.create({
      data: {
          ticketId: ticket.id,
          userId: admin.id,
          body: "We apologize for the inconvenience. We have dispatched a replacement.",
          createdAt: new Date(Date.now() - 3 * 86400000),
      }
  });
  console.log("✅ Seeded SupportTicket and Reply");

  // SystemConfig
  await prisma.systemConfig.create({
      data: {
          key: `app_name_${uid()}`,
          value: "CoreInventory Systems",
          type: "string",
          label: "Application Name",
          description: "Global application name displayed in header",
          category: "general",
          isPublic: true,
          createdAt: new Date(),
      }
  });
  console.log("✅ Seeded SystemConfig");

  // UserAction
  await prisma.userAction.create({});
  console.log("✅ Seeded UserAction");

  // VerificationToken
  await prisma.verificationToken.create({
      data: {
          token: { token: `verify_${uid()}` }
      }
  });
  console.log("✅ Seeded VerificationToken");

  // AuditLog
  await prisma.auditLog.create({
      data: {
          userId: admin.id,
          action: "login",
          entityType: "user",
          entityId: admin.id,
          details: { method: "credentials" },
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          createdAt: new Date(),
      }
  });
  console.log("✅ Seeded AuditLog");

  console.log("✨ Advanced collection seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
