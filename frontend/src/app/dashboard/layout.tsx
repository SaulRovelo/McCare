"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { Separator } from "@/components/ui/separator"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSessionUser, hasRole, clearSession } from "@/lib/auth"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Verificar sesión (solo admin en el dashboard, o corporativo si acceden a algo aquí)
    const user = getSessionUser()
    if (!user || !["admin", "corporativo"].includes(user.rol)) {
      router.replace("/login")
      return
    }
    setUserName(user.nombre)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    clearSession()
    router.replace("/login")
  }

  if (loading) return null // or a skeleton

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Hola, {userName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600 gap-2">
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 bg-muted/30">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
