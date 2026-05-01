import type { ReactNode } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { exigirAdminPagina } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LayoutAdmin({ children }: { children: ReactNode }) {
  const admin = await exigirAdminPagina();
  return <AdminLayout admin={admin}>{children}</AdminLayout>;
}
