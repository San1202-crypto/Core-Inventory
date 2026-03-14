import { ReactNode } from "react";
import SupplierLayout from "@/components/layouts/SupplierLayout";

export const metadata = {
  title: "Supplier Portal",
  description: "Stockly Supplier Portal — Manage your products, orders, and insights.",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <SupplierLayout>{children}</SupplierLayout>;
}
