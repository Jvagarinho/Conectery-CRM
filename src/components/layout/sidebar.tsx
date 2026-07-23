"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Settings,
  Building2,
  Calendar,
  Video,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/companies", label: "Empresas", icon: Building2 },
  { href: "/deals", label: "Deals", icon: Briefcase },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/calendar", label: "Calendário", icon: Calendar },
  { href: "/meetings", label: "Reuniões", icon: Video },
  { href: "/email", label: "E-mails", icon: Mail },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">Conectery</h1>
        <p className="text-sm text-gray-400">CRM</p>
      </div>
      <nav className="flex-1 mt-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors",
                pathname === link.href && "bg-gray-800 text-white border-l-4 border-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">© 2026 Conectery</p>
      </div>
    </aside>
  );
}
