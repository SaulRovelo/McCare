"use client"

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/corporativo/sidebar";
import { KpiCards } from "@/components/corporativo/kpi-cards";
import { EsgChart } from "@/components/corporativo/esg-chart";
import { MatchingGifts } from "@/components/corporativo/matching-gifts";
import { FiscalSection } from "@/components/corporativo/fiscal-section";
import { Download, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCorporativoResumen } from "@/services/api";

export default function CorporativoDashboard() {
  const [activeItem, setActiveItem] = useState("resumen");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCorporativoResumen(30)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching corporate summary", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden bg-slate-50 font-sans">
      <DashboardSidebar activeItem={activeItem} setActiveItem={setActiveItem} />

      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Cabecera global del Dashboard */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Portal de Socio Corporativo</h1>
              <p className="mt-1 flex items-center gap-2 text-slate-500">
                <Building2 className="h-4 w-4" /> Global Corp S.A. de C.V.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {data && (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 px-3 py-1.5 font-medium text-amber-600">
                  Socio Nivel {data.nivel_partnership}
                </Badge>
              )}
              <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <Download className="h-4 w-4" />
                Reporte Anual ESG
              </Button>
            </div>
          </div>

          {!loading && data ? (
            <>
              {/* Componentes Modularizados con Data Viva */}
              <KpiCards data={data} />
              <EsgChart />

              <div className="grid gap-6 lg:grid-cols-2">
                <MatchingGifts campanias={data.campanias_activas} />
                <FiscalSection documentos={data.documentos_fiscales} />
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DA291C] border-t-transparent"></div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}