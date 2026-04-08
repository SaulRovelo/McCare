
"use client"

import { useState } from "react";
import { DashboardSidebar } from "@/components/corporativo/sidebar";
import { KpiCards } from "@/components/corporativo/kpi-cards";
import { EsgChart } from "@/components/corporativo/esg-chart";
import { MatchingGifts } from "@/components/corporativo/matching-gifts";
import { FiscalSection } from "@/components/corporativo/fiscal-section";
import { Download, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CorporativoDashboard() {
  const [activeItem, setActiveItem] = useState("resumen");

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-slate-50 font-sans">

      {/* Sidebar Modularizado */}
      <DashboardSidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Cabecera global del Dashboard */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Portal de Socio Corporativo</h1>
              <p className="mt-1 flex items-center gap-2 text-slate-500">
                <Building2 className="h-4 w-4" /> TechCorp S.A. de C.V.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-600">
                Socio Nivel Oro
              </Badge>
              <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <Download className="h-4 w-4" />
                Reporte Anual ESG
              </Button>
            </div>
          </div>

          {/* Componentes Modularizados */}
          <KpiCards />
          <EsgChart />

          <div className="grid gap-6 lg:grid-cols-2">
            <MatchingGifts />
            <FiscalSection />
          </div>

        </div>
      </main>
    </div>
  );
}
