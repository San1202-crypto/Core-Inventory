import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { prisma } from "@/prisma/client";
import { logger } from "@/lib/logger";
import { createAuditLog } from "@/prisma/audit-log";
import { createInventoryAdjustmentSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId");

    let adjustmentWhere: any = {
      ...(warehouseId && { warehouseId }),
    };

    if (session.role === "supplier") {
      const supplier = await prisma.supplier.findFirst({ where: { userId: session.id } });
      if (!supplier) {
        return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
      }
      adjustmentWhere.items = {
        some: {
          product: {
            supplierId: supplier.id
          }
        }
      };
    }

    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: adjustmentWhere,
      include: {
        warehouse: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitized = adjustments.map(adj => ({
      ...adj,
      items: adj.items.map(item => ({
        ...item,
        variance: Number(item.variance),
        expectedQuantity: Number(item.expectedQuantity),
        countedQuantity: Number(item.countedQuantity),
        product: item.product ? {
          ...item.product,
          quantity: Number(item.product.quantity),
          price: Number(item.product.price)
        } : null
      }))
    }));

    return NextResponse.json(sanitized);
  } catch (error) {
    logger.error("Error fetching inventory adjustments", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory adjustments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session || session.role === "supplier") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = createInventoryAdjustmentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { warehouseId, reason, items } = validation.data;

    // Generate unique reference number: ADJ-YYYYMMDD-XXXX
    const date = new Date();
    const isoString = date.toISOString();
    const dateString = isoString.split("T")[0]?.replace(/-/g, "") || "00000000";
    const count = await prisma.inventoryAdjustment.count({
      where: {
        referenceNumber: {
          startsWith: `ADJ-${dateString}`,
        },
      },
    });
    const referenceNumber = `ADJ-${dateString}-${(count + 1).toString().padStart(4, "0")}`;

    const adjustment = await prisma.inventoryAdjustment.create({
      data: {
        referenceNumber,
        warehouseId,
        reason,
        userId: session.id,
        status: "draft", // Always starts as draft
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            expectedQuantity: item.expectedQuantity,
            countedQuantity: item.countedQuantity,
            variance: item.countedQuantity - item.expectedQuantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    try {
      await createAuditLog({
        userId: session.id,
        action: "create",
        entityType: "inventory_adjustment",
        entityId: adjustment.id,
        details: { referenceNumber },
      });
    } catch (e) {
      // Ignore audit log error
    }

    return NextResponse.json(adjustment, { status: 201 });
  } catch (error) {
    logger.error("Error creating inventory adjustment", error);
    return NextResponse.json(
      { error: "Failed to create inventory adjustment" },
      { status: 500 }
    );
  }
}
