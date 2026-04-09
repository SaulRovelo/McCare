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
        <Link href="/" className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DB0007]">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">McCare</span>
            <span className="text-xs text-muted-foreground">Panel del Donante</span>
          </div>
        </Link>
        
        {/* User Profile Underneath Header */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-border/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DB0007] to-[#FFBC0D] flex items-center justify-center shrink-0 shadow-sm relative">
            <span className="text-white text-sm font-bold">{userName.substring(0,2).toUpperCase()}</span>
            {/* Pequeña campana de notificaciones superpuesta al perfil o a un lado */}
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#DB0007] border-2 border-white rounded-full flex items-center justify-center">
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-foreground text-[0.8125rem] font-bold leading-tight truncate">
              {userName}
            </p>
            <p className="text-muted-foreground text-[0.65rem] font-medium leading-tight truncate">
              Donante Individual
            </p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <div className="relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#DB0007] rounded-full" />
            </div>
          </button>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 mt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-1">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuPrincipal.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} className="h-10">
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
