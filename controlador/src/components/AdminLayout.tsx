import type { ReactNode } from "react";
import type { AdminSession } from "@/lib/auth";
import styles from "@/styles/admin.module.css";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

type AdminLayoutProps = {
  admin: AdminSession;
  children: ReactNode;
};

export function AdminLayout({ admin, children }: AdminLayoutProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <Header nome={admin.nome} email={admin.email} />
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
