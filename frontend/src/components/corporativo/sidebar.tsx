"use client"

import { useState } from "react";
import Link from "next/link";
import { BarChart3, FileText, Receipt, Users, Settings, Heart, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { id: "resumen", label: "Resumen Ejecutivo", icon: BarChart3 },
  { id: "esg", label: "Reportes ESG", icon: FileText },
  { id: "fiscal", label: "Recibos Fiscales", icon: Receipt },
  { id: "voluntariado", label: "Voluntariado Corporativo", icon: Users },
  { id: "configuracion", label: "Configuración de Empresa", icon: Settings },
];

interface SidebarProps {
  activeItem: string;
  setActiveItem: (id: string) => void;
}

export function DashboardSidebar({ activeItem, setActiveItem }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn("h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0", collapsed ? "w-[68px]" : "w-[260px]")}>
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 shrink-0">
          <Heart className="w-6 h-6 text-[#DA291C] fill-[#DA291C] shrink-0" />
          {!collapsed && <span className="text-slate-900 tracking-tight whitespace-nowrap" style={{ fontSize: "1.125rem", fontWeight: 600 }}>McCare B2B</span>}
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const button = (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer", isActive ? "bg-[#DA291C]/10 text-[#DA291C]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap" style={{ fontSize: "0.875rem", fontWeight: isActive ? 500 : 400 }}>{item.label}</span>}
              </button>
            );
            return collapsed ? (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : button;
          })}
        </nav>
        <div className="border-t border-slate-100 p-3 space-y-1">
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer">
            {collapsed ? <ChevronRight className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
            {!collapsed && <span style={{ fontSize: "0.875rem" }}>Colapsar</span>}
          </button>
          <Button asChild variant="ghost" className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 cursor-pointer">
            <Link href="/">
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span style={{ fontSize: "0.875rem" }}>Volver al Portal</span>}
            </Link>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}