import { Suspense } from "react";
import AdjustmentsList from "@/components/admin/inventory-adjustments/AdjustmentsList";
import { PageContentWrapper } from "@/components/shared";
import { getSession } from "@/lib/auth-server";

export const metadata = {
  title: "Inventory Adjustments | Admin Dashboard",
  description: "Manage inventory cycle counts and stock adjustments",
};

export default async function InventoryAdjustmentsPage() {
  const user = await getSession();
  if (!user) return null;

  return (
    <PageContentWrapper>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      >
        <AdjustmentsList />
      </Suspense>
    </PageContentWrapper>
  );
}
