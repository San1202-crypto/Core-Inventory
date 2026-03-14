import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { prisma } from "@/prisma/client";

/**
 * GET /api/stocks/movements
 * Returns stock movement history for the ledger.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movements = await prisma.stockMovement.findMany({
      include: {
        product: {
          select: { name: true, sku: true, unitOfMeasure: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: movements });
  } catch (error: any) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}
