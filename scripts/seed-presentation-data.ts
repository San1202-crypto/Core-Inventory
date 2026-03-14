import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// Helper to get random number between min and max
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper for unique ID
const uid = () => crypto.randomBytes(4).toString("hex").toUpperCase();

async function main() {
  console.log("🌱 Generating comprehensive presentation data...");

  // 1. Get existing admin to associate records
  let admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (!admin) {
     const adminPassword = await bcrypt.hash("password123", 10);
     admin = await prisma.user.create({
       data: {
         email: `admin_${uid()}@test.com`,
         name: "Admin User",
         role: "admin",
         password: adminPassword,
         username: `admin_${uid()}`,
         createdAt: new Date(),
       }
     });
  }

  // 1b. Create some Clients
  const clients = [];
  const clientNames = ["Acme Corp", "TechNova", "Global Logistics", "Stark Industries", "Wayne Enterprises"];
  for (const name of clientNames) {
    const client = await prisma.user.create({
      data: {
        email: `contact_${uid()}@${name.replace(" ", "").toLowerCase()}.com`,
        name: name,
        role: "client",
        password: "password123", /* dummy */
        username: `client_${uid()}`,
        createdAt: new Date(),
      },
    });
      clients.push(client);
  }
  console.log(`✅ Created ${clients.length} clients`);

  // 2. Create additional Warehouses
  const warehouseNames = ["North Regional", "South Hub", "East Coast Dist", "West Coast Storage"];
  const warehouses = await Promise.all(
    warehouseNames.map(async (name) => {
      return prisma.warehouse.create({
        data: {
          name: `${name} ${uid()}`,
          code: `WH-${uid()}`,
          location: `${randomInt(10, 999)} Commerce Way, CityArea`,
          description: "Regional distribution center",
          isActive: true,
          userId: admin!.id,
          createdBy: admin!.id,
          createdAt: new Date(),
        },
      });
    })
  );
  // Also get existing warehouses to mix in
  const allWarehouses = await prisma.warehouse.findMany();
  console.log(`✅ Created/Fetched ${allWarehouses.length} warehouses`);

  // 3. Create Categories
  const categoryNames = ["Laptops", "Peripherals", "Networking", "Office Supplies", "Server Hardware"];
  const categories = await Promise.all(
    categoryNames.map(async (name) => {
      return prisma.category.create({
        data: {
          name: `${name} ${uid()}`,
          description: `All items related to ${name}`,
          status: true,
          userId: admin!.id,
          createdBy: admin!.id,
          createdAt: new Date(),
        },
      });
    })
  );
  console.log(`✅ Created ${categories.length} categories`);

  // 4. Create Suppliers
  const supplierNames = ["Dell Technologies", "Logitech Corp", "Cisco Systems", "Staples Business", "HP Enterprise"];
  const suppliers = await Promise.all(
    supplierNames.map(async (name) => {
      return prisma.supplier.create({
        data: {
          name: `${name} ${uid()}`,
          status: true,
          userId: admin!.id,
          createdBy: admin!.id,
          createdAt: new Date(),
        },
      });
    })
  );
  console.log(`✅ Created ${suppliers.length} suppliers`);

  // 5. Create Products (about 30)
  const productAdjectives = ["Pro", "Max", "Ultra", "Lite", "Enterprise", "Standard", "Mini", "Plus"];
  const productNouns = ["Router", "Switch", "Keyboard", "Mouse", "Monitor", "Laptop", "Server", "Hub", "Pen", "Desk"];
  const products = [];
  for (let i = 0; i < 30; i++) {
    const noun = randomItem(productNouns);
    const adj = randomItem(productAdjectives);
    const cat = randomItem(categories);
    const sup = randomItem(suppliers);
    
    // Distribute among warehouses
    const targetWH = randomItem(allWarehouses);
    const stockQty = randomInt(50, 500);
    
    const product = await prisma.product.create({
      data: {
        name: `${noun} ${adj} ${randomInt(1, 9)}`,
        sku: `SKU-${uid()}-${i}`,
        price: randomInt(10, 1500) + 0.99,
        quantity: stockQty,
        status: stockQty > 100 ? "Available" : "Low Stock",
        categoryId: cat.id,
        supplierId: sup.id,
        userId: admin!.id,
        createdBy: admin!.id,
        unitOfMeasure: randomItem(["unit", "box", "pallet"]),
        createdAt: new Date(Date.now() - randomInt(1, 100) * 86400000), // Random past date
      },
    });
    
    // Create stock allocation
    await prisma.stock.create({
      data: {
        productId: product.id,
        warehouseId: targetWH.id,
        quantity: stockQty,
        reservedQuantity: 0,
        userId: admin!.id,
      }
    });

    products.push(product);
  }
  console.log(`✅ Created ${products.length} products with stock allocations`);

  // 6. Create Receipts (Incoming Stock)
  for (let i = 0; i < 15; i++) {
    const targetWH = randomItem(allWarehouses);
    const sup = randomItem(suppliers);
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber: `RCP-${uid()}`,
        supplierName: sup.name,
        warehouseId: targetWH.id,
        status: "validated",
        userId: admin!.id,
        createdAt: new Date(Date.now() - randomInt(1, 30) * 86400000),
      }
    });

    // Add 1-4 items per receipt
    const numItems = randomInt(1, 4);
    for (let j = 0; j < numItems; j++) {
      const prod = randomItem(products);
      const qty = randomInt(10, 100);
      await prisma.receiptItem.create({
        data: {
          receiptId: receipt.id,
          productId: prod.id,
          quantityReceived: qty,
        }
      });
      // Create stock movement record
      await prisma.stockMovement.create({
        data: {
          productId: prod.id,
          movementType: "INCOMING",
          quantity: qty,
          source: sup.name,
          destination: targetWH.name,
          referenceDocument: receipt.id,
          userId: admin!.id,
          notes: "Presentation data seed",
        }
      });
    }
  }
  console.log(`✅ Created 15 validated receipts and incoming movements`);

  // 7. Create Orders (Sales / Outgoing) and Invoices
  const statuses = ["delivered", "processing", "shipped", "pending"];
  for (let i = 0; i < 40; i++) {
    const client = randomItem(clients);
    const orderStatus = randomItem(statuses);
    
    // generate items
    const numItems = randomInt(1, 5);
    const selectedProducts = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
       const p = randomItem(products);
       if(!selectedProducts.find(sp => sp.id === p.id)) {
           selectedProducts.push(p);
       }
    }

    const orderReqs = selectedProducts.map(p => {
        const qty = randomInt(1, 5);
        const st = qty * p.price;
        subtotal += st;
        return { product: p, qty, st };
    });

    const tax = subtotal * 0.1;
    const shipping = randomInt(10, 50);
    const total = subtotal + tax + shipping;
    
    const creationDate = new Date(Date.now() - randomInt(1, 60) * 86400000);

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${uid()}`,
        userId: admin!.id,
        clientId: client.id,
        status: orderStatus,
        paymentStatus: orderStatus === "delivered" ? "paid" : "unpaid",
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        createdAt: creationDate,
        createdBy: admin!.id,
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
           subtotal: req.st,
         }
       });

       // Create stock movement for shipped/delivered orders
       if (orderStatus === "shipped" || orderStatus === "delivered" || orderStatus === "processing") {
          await prisma.stockMovement.create({
            data: {
              productId: req.product.id,
              movementType: "OUTGOING",
              quantity: req.qty,
              source: allWarehouses[0]?.name || "Central Warehouse",
              destination: client.name,
              referenceDocument: order.id,
              userId: admin!.id,
              notes: "Presentation sales data seed",
              createdAt: new Date(creationDate.getTime() + 86400000) // 1 day after order
            }
          });
       }
    }

    // Create Invoice for Order
    await prisma.invoice.create({
        data: {
            invoiceNumber: `INV-${uid()}`,
            orderId: order.id,
            userId: admin!.id,
            clientId: client.id,
            status: orderStatus === "delivered" ? "paid" : (orderStatus === "pending" ? "draft" : "sent"),
            subtotal: subtotal,
            tax: tax,
            shipping: shipping,
            total: total,
            amountPaid: orderStatus === "delivered" ? total : 0,
            amountDue: orderStatus === "delivered" ? 0 : total,
            dueDate: new Date(creationDate.getTime() + 30 * 86400000), // +30 days
            issuedAt: creationDate,
            createdAt: creationDate,
            createdBy: admin!.id,
        }
    });
  }
  console.log(`✅ Created 40 orders with order items and invoices`);

  console.log("✨ Data presentation seeding complete! Your dashboard should look amazing.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
