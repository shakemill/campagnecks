"use client";

import {
  ClipboardList,
  FilePlus2,
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { UserRole } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

type SidebarProps = {
  role: UserRole;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campagnes", icon: ClipboardList },
  { href: "/screenings/new", label: "Nouvelle fiche", icon: FilePlus2 },
  { href: "/screenings", label: "Fiches", icon: Stethoscope },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full bg-sidebar text-sidebar-foreground lg:min-h-screen lg:w-72">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-pink text-white">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-lg font-bold leading-tight">Cks Manager</p>
          <p className="truncate text-xs text-zinc-200">
            Role: {role === "MEDECIN" ? "Medecin" : "Infirmier/Tech"}
          </p>
        </div>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ease-in-out",
                isActive
                  ? "bg-brand-pink text-white shadow-sm"
                  : "text-zinc-100 hover:bg-sidebar-accent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
