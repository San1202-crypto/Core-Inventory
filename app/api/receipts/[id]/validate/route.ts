import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { validateReceipt } from "@/prisma/receipt";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const receipt = await validateReceipt(id, session.id);

    return NextResponse.json({
      message: "Receipt validated successfully",
      receipt,
      summary: receipt.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantityReceived,
        newStock: Number(item.product.quantity)
      }))
    });
  } catch (error: any) {
    logger.error("Error validating receipt:", error);
    return NextResponse.json({ error: error.message || "Failed to validate receipt" }, { status: 500 });
  }
}
