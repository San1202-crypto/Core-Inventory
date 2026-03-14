"use client";

import React from "react";
import ReceiptList from "@/components/receipts/ReceiptList";
import { PageContentWrapper } from "@/components/shared";

export default function ReceiptsPageClient() {
  return (
    <PageContentWrapper>
      <div className="p-4 sm:p-8">
        <ReceiptList />
      </div>
    </PageContentWrapper>
  );
}
