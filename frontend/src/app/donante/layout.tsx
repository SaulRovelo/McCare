"use client"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { DonanteSidebar } from "@/components/donante/DonanteSidebar"

export default function DonorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DonanteSidebar />
      <SidebarInset className="h-screen overflow-hidden flex flex-col relative">
        {/* Toggle flotante para mobile si queremos que todo quede limpio sin header completo */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
            <SidebarTrigger className="bg-white/80 backdrop-blur shadow-sm border border-border" />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/30">
          <div className="mx-auto max-w-[1400px] h-full flex flex-col pt-8 md:pt-0">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
