"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  Target,
  Award,
  FileText,
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Inicio", path: "/donante" },
  { icon: Target, label: "Misiones", path: "/donante/misiones" },
  { icon: Award, label: "Certificados", path: "/donante/certificados" },
  { icon: FileText, label: "Recibos Fiscales", path: "/donante/recibos" },
  { icon: Settings, label: "Configuración", path: "/donante/configuracion" },
];

export default function DonorDashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === "/donante") return pathname === "/donante";
    return pathname.startsWith(path);
  };

  return (
    <div className="flex justify-between h-screen overflow-hidden" style={{ backgroundColor: "#FBFBFB" }}>
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-100 transition-all duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${collapsed ? "w-[72px]" : "w-[260px]"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 shrink-0">
          <Heart className="w-6 h-6 text-[#DA291C] fill-[#DA291C] shrink-0" />
          {!collapsed && (
            <span className="text-slate-900" style={{ fontSize: "1.0625rem", fontWeight: 700 }}>
              McCare
            </span>
          )}
          {/* Mobile close */}
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all cursor-pointer
                  ${collapsed ? "justify-center" : ""}
                  ${active
                    ? "bg-[#DA291C]/8 text-[#DA291C]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" style={active ? { strokeWidth: 2.2 } : {}} />
                {!collapsed && (
                  <span style={{ fontSize: "0.875rem", fontWeight: active ? 600 : 500 }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1 border-t border-slate-100 pt-3">
          {/* Collapse toggle (desktop only) */}
          <button
            className="hidden lg:flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 shrink-0 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Colapsar</span>
              </>
            )}
          </button>
          <Link href="/login" passHref>
            <button
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition cursor-pointer ${collapsed ? "justify-center" : ""}`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Cerrar sesión</span>}
            </button>
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700 cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition cursor-pointer">
              <Bell className="w-4.5 h-4.5 text-slate-500" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#DA291C] rounded-full border-2 border-white" />
            </button>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DA291C] to-[#FFBC0D] flex items-center justify-center">
                <span className="text-white" style={{ fontSize: "0.75rem", fontWeight: 700 }}>MA</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-slate-900" style={{ fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.3 }}>
                  María Alejandra
                </p>
                <p className="text-slate-400" style={{ fontSize: "0.6875rem", lineHeight: 1.2 }}>
                  Donante Individual
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto w-full p-4 lg:p-6" style={{maxWidth: "1400px"}}>
          {children}
        </main>
      </div>
    </div>
  );
}
