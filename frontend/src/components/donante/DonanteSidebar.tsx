"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Heart,
  LayoutDashboard,
  Target,
  FileText,
  Settings,
  LogOut,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { getSessionUser, clearSession } from "@/lib/auth"

const menuPrincipal = [
  { title: "Inicio",              href: "/donante",               icon: LayoutDashboard },
  { title: "Misiones Activas",    href: "/donante/misiones",      icon: Target },
  { title: "Recibos Fiscales",    href: "/donante/recibos",       icon: FileText },
  { title: "Configuración",       href: "/donante/configuracion", icon: Settings },
]

export function DonanteSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState("María Alejandra")

  useEffect(() => {
    const user = getSessionUser()
    if (user && user.nombre) {
      setUserName(user.nombre)
    }
  }, [])

  const handleLogout = () => {
    clearSession()
    router.replace("/login")
  }

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3 mb-6 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#DA291C] to-[#DA291C]/80 shadow-lg shadow-red-500/20">
            <Heart className="h-6 w-6 text-white fill-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">McCare</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Donor Portal</span>
          </div>
        </Link>
        
        {/* User Profile Underneath Header */}
        <div className="flex items-center gap-3 p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50 transition-all hover:bg-slate-100 group cursor-default">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center shrink-0 shadow-md relative group-hover:scale-105 transition-transform">
            <span className="text-white text-sm font-black">{userName.substring(0,2).toUpperCase()}</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-slate-900 text-sm font-black leading-tight truncate">
              {userName}
            </p>
            <p className="text-slate-500 text-[10px] font-bold leading-tight truncate uppercase tracking-tighter mt-0.5">
              Héroe McCare
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 mt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-1">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuPrincipal.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href} 
                    className={cn(
                      "h-11 rounded-xl px-4 transition-all duration-200",
                      pathname === item.href 
                        ? "bg-[#DA291C] text-white shadow-lg shadow-red-500/20 hover:bg-[#DA291C] hover:text-white" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-slate-400")} />
                      <span className="font-bold text-[13px]">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="h-10 text-slate-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
