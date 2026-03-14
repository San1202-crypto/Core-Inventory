import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// Helper to get random number between min and max
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper for unique ID
const uid = () => crypto.randomBytes(4).toString("hex").toUpperCase();

async function main() {
  console.log("🌱 Generating an additional 10 orders with varied and future statuses...");

  // Get some reference data
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  const clients = await prisma.user.findMany({ where: { role: "client" } });
  const products = await prisma.product.findMany();
  const warehouses = await prisma.warehouse.findMany();
  
  if (!admin || clients.length === 0 || products.length === 0) {
      console.log("Missing base resources. Please run seed-presentation-data script first.");
      return;
  }

  // Define assorted statuses including the new picked/packed workflow states
  const statuses = [
      "pending", 
      "processing", 
      "picked", 
      "packed", 
      "shipped", 
      "delivered", 
      "cancelled"
  ];

  // We want to simulate orders spanning from 5 days ago to 30 days IN THE FUTURE
  for (let i = 0; i < 10; i++) {
    const client = randomItem(clients);
    const orderStatus = randomItem(statuses);
    
    // Generate dates - some slightly in the past, some in the future
    // Day offset from -5 to +30 days
    const dayOffset = randomInt(-5, 30);
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() + dayOffset);
    
    // Payment logic based on status and time
    let paymentStatus = "unpaid";
    if (orderStatus === "delivered" || orderStatus === "shipped") paymentStatus = "paid";
    if (orderStatus === "cancelled") paymentStatus = randomItem(["refunded", "unpaid"]);
    if (dayOffset < 0 && orderStatus !== "cancelled") paymentStatus = randomItem(["paid", "partial", "unpaid"]);

    // Generate items
    const numItems = randomInt(1, 4);
    const selectedProducts: typeof products = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
       const p = randomItem(products);
       if(!selectedProducts.find(sp => sp.id === p.id)) {
           selectedProducts.push(p);
       }
    }

    const orderReqs = selectedProducts.map(p => {
        const qty = randomInt(1, 10);
        const st = qty * p.price;
        subtotal += st;
        return { product: p, qty, st };
    });

    const tax = Number((subtotal * 0.1).toFixed(2));
    const shipping = randomInt(15, 75);
    const total = Number((subtotal + tax + shipping).toFixed(2));

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${uid()}`,
        userId: admin.id,
        clientId: client.id,
        status: orderStatus,
        paymentStatus: paymentStatus,
        subtotal: Number(subtotal.toFixed(2)),
        tax: tax,
        shipping: shipping,
        total: total,
        createdAt: creationDate,
        createdBy: admin.id,
      }
    });

    // Create Order Items
    for (const req of orderReqs) {
       await prisma.orderItem.create({
         data: {
           orderId: order.id,
           productId: req.product.id,
           productName: req.product.name,
           sku: req.product.sku,
           quantity: req.qty,
           price: req.product.price,
           subtotal: Number(req.st.toFixed(2)),
         }
       });

       // Create stock movement for relevant statuses if it's not a future order 
       // (future orders represent scheduled transfers/shipments)
       if (dayOffset <= 0 && (orderStatus === "shipped" || orderStatus === "delivered" || orderStatus === "processing")) {
          await prisma.stockMovement.create({
            data: {
              productId: req.product.id,
              movementType: "OUTGOING",
              quantity: req.qty,
              source: warehouses[0]?.name || "Central Warehouse",
              destination: client.name,
              referenceDocument: order.id,
              userId: admin.id,
              notes: `Order fulfillment (${orderStatus})`,
              createdAt: new Date(creationDate.getTime() + 3600000) // 1 hr after order
            }
          });
       }
    }

    // Invoice Status Logic
    let invStatus = "draft";
    let amtPaid = 0;
    
    if (paymentStatus === "paid") {
        invStatus = "paid";
        amtPaid = total;
    } else if (paymentStatus === "partial") {
        invStatus = "sent";
        amtPaid = Number((total / 2).toFixed(2));
    } else if (orderStatus === "cancelled") {
        invStatus = "cancelled";
    } else if (dayOffset <= 0) {
        invStatus = "sent";
    }

    // Create Invoice for Order
    await prisma.invoice.create({
        data: {
            invoiceNumber: `INV-${uid()}`,
            orderId: order.id,
            userId: admin.id,
            clientId: client.id,
            status: invStatus,
            subtotal: Number(subtotal.toFixed(2)),
            tax: tax,
            shipping: shipping,
            total: total,
            amountPaid: amtPaid,
            amountDue: Number((total - amtPaid).toFixed(2)),
            dueDate: new Date(creationDate.getTime() + 14 * 86400000), // +14 days from order creation
            issuedAt: creationDate,
            createdAt: creationDate,
            createdBy: admin.id,
        }
    });

    console.log(`✅ Created Order & Invoice: Status=${orderStatus}, Date=${creationDate.toISOString().split('T')[0]}, Total=₹${total}`);
  }

  console.log("✨ Generated 10 additional varied and future orders.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
