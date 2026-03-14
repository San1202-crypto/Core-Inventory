import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { addReceiptItems } from "@/prisma/receipt";
import { addReceiptItemsSchema } from "@/lib/validations/receipt";
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
    const body = await request.json();
    const { items } = addReceiptItemsSchema.parse(body);

    await addReceiptItems(id, items);

    return NextResponse.json({ message: "Items added successfully" });
  } catch (error: any) {
    logger.error("Error adding items to receipt:", error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to add items" }, { status: 500 });
  }
}
