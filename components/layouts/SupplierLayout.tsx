"use client";

import React, { type ReactNode } from "react";
import Navbar from "@/components/layouts/Navbar";
import PageWithSidebar from "@/components/layouts/PageWithSidebar";
import SupplierSidebar from "@/components/layouts/SupplierSidebar";

/**
 * Supplier layout: Navbar + left SupplierSidebar + scrollable content.
 */
export default function SupplierLayout({ children }: { children: ReactNode }) {
  return (
    <Navbar>
      <PageWithSidebar
        sidebarContent={<SupplierSidebar />}
        sidebarCollapsed={<SupplierSidebar collapsed />}
      >
        <div className="min-w-0 flex-1 px-1 sm:px-0">
          <div className="max-w-7xl mx-auto py-6">
            {children}
          </div>
        </div>
      </PageWithSidebar>
    </Navbar>
  );
}
