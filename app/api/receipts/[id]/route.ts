import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { prisma } from "@/prisma/client";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sku: true }
            }
          }
        },
        warehouse: true
      }
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    return NextResponse.json(receipt);
  } catch (error) {
    logger.error("Error fetching receipt:", error);
    return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 });
  }
}
