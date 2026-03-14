"use client";

import { Dispatch, SetStateAction } from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaCheck } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { LuGitPullRequestDraft } from "react-icons/lu";
import { Product } from "@/types"; // Import shared interfaces

const statuses = [
  { value: "Available", label: "Available", icon: <FaCheck /> },
  { value: "Stock Out", label: "Stock Out", icon: <IoClose /> },
  { value: "Stock Low", label: "Stock Low", icon: <LuGitPullRequestDraft /> },
];

export default function Status({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: string;
  setSelectedTab: Dispatch<SetStateAction<Product["status"]>>;
}) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-zinc-100 text-zinc-600";
      case "Stock Out":
        return "bg-zinc-100 text-zinc-600";
      case "Stock Low":
        return "bg-zinc-100 text-zinc-600";
      default:
        return "";
    }
  };

  return (
    <div>
      <Label className="text-slate-600">Status</Label>
      <Tabs
        value={selectedTab}
        onValueChange={(value: string) =>
          setSelectedTab(value as Product["status"])
        }
        className="mt-1"
      >
        <TabsList className="h-11 px-2">
          {statuses.map((status) => (
            <TabsTrigger
              key={status.value}
              className={`h-8 ${getStatusClass(status.value)} ${
                selectedTab === status.value ? "font-semibold" : ""
              }`}
              value={status.value}
            >
              {status.icon}
              {status.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

