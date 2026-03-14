import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { StockService } from "@/modules/stock/api/stock.service";

/**
 * POST /api/stocks/adjust
 * Payload: { productId, warehouseId, quantity, type, reason }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, warehouseId, quantity, type, reason } = body;

    if (!productId || !warehouseId || !quantity || !type) {
      return NextResponse.json(
        { error: "productId, warehouseId, quantity, and type are required." },
        { status: 400 }
      );
    }

    const stock = await StockService.adjustStock({
      productId,
      warehouseId,
      quantity: Math.abs(parseInt(String(quantity), 10)),
      type,
      reason: reason || "No reason provided",
      userId: user.id,
    });

    return NextResponse.json({ success: true, data: stock });
  } catch (error: any) {
    console.error("Error adjusting stock:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to adjust stock" },
      { status: 500 }
    );
  }
}
