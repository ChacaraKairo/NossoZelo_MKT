"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  MailWarning,
  ScrollText,
  Settings,
  ShieldCheck,
  Stethoscope,
  Users
} from "lucide-react";
import styles from "@/styles/admin.module.css";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/prestadores", label: "Prestadores", icon: Stethoscope },
  { href: "/pendencias", label: "Pendencias", icon: AlertTriangle },
  { href: "/assinaturas", label: "Assinaturas", icon: ClipboardList },
  { href: "/email", label: "E-mails", icon: MailWarning },
  { href: "/logs", label: "Logs", icon: ScrollText },
  { href: "/configuracoes", label: "Configuracoes", icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <ShieldCheck size={28} />
        Controlador NossoZelo
        <span>Painel administrativo interno</span>
      </div>

      <nav className={styles.nav} aria-label="Navegacao administrativa">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
              href={link.href}
              key={link.href}
            >
              <Icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
