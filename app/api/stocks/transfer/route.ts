import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { StockService } from "@/modules/stock/api/stock.service";

/**
 * POST /api/stocks/transfer
 * Payload: { productId, fromWarehouseId, toWarehouseId, quantity }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, fromWarehouseId, toWarehouseId, quantity } = body;

    if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
      return NextResponse.json(
        { error: "productId, fromWarehouseId, toWarehouseId, and quantity are required." },
        { status: 400 }
      );
    }

    await StockService.transferStock({
      productId,
      fromWarehouseId,
      toWarehouseId,
      quantity: Math.abs(parseInt(String(quantity), 10)),
      userId: user.id,
    });

    return NextResponse.json({ success: true, message: "Stock transferred successfully." });
  } catch (error: any) {
    console.error("Error transferring stock:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to transfer stock" },
      { status: 500 }
    );
  }
}
