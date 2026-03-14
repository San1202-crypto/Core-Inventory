import { getSession } from "@/lib/auth-server";
import ReceiptsPageClient from "./ReceiptsPageClient";
import { redirect } from "next/navigation";

export default async function AdminReceiptsPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return <ReceiptsPageClient />;
}
