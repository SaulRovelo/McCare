
"use client"

import { useEffect, useState } from "react";
import {
  Brain,
  RefreshCw,
  Activity,
  AlertTriangle,
  Clock,
  Zap,
  Flame,
  ShieldAlert,
  Package,
  Baby,
  Pill,
  Droplets,
  Thermometer,
  Utensils,
  BedDouble,
  Heart,
  ChevronLeft,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
// IMPORTANTE: Asegúrate de que esta ruta apunte correctamente a tu API real
import { getForecast } from "@/services/api";

/* ═══════════════════════════════════════════════════
   CONFIGURACIÓN VISUAL
   ═══════════════════════════════════════════════════ */

const statusConfig: Record<string, any> = {
  critico: { label: "Crítico", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", badgeBg: "bg-red-600" },
  atencion: { label: "En Atención", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", badgeBg: "bg-amber-500" },
  estable: { label: "Estable", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", badgeBg: "bg-emerald-600" },
};

const impactConfig: Record<string, string> = {
  "Muy Alto": "bg-red-100 text-red-700 border-red-200",
  "Alto": "bg-amber-100 text-amber-700 border-amber-200",
  "Medio": "bg-blue-100 text-blue-700 border-blue-200",
};

// Función auxiliar para asignar iconos genéricos según el nombre o categoría si no vienen de la API
const getIconForCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("biberón") || n.includes("pañal")) return Baby;
  if (n.includes("leche") || n.includes("papilla")) return Utensils;
  if (n.includes("toalla") || n.includes("jabón")) return Droplets;
  if (n.includes("paracetamol") || n.includes("suero")) return Pill;
  if (n.includes("sábana") || n.includes("cobija")) return BedDouble;
  return Package;
};

/* ═══════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════ */

export default function CareforecastPage() {
  const [supplies, setSupplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchForecastData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getForecast(50);

      // Adaptamos los datos de tu API al formato que necesita el diseño de Figma
      const mappedData = data.map((item: any) => ({
        id: item.id || Math.random().toString(),
        name: item.nombre || item.insumo_nombre || "Insumo Desconocido",
        category: item.categoria || "General",
        icon: getIconForCategory(item.nombre || ""),
        stock: item.stock_actual || 0,
        unit: item.unidad_medida || "uds",
        consumptionPerDay: item.consumo_diario_estimado || 0,
        // Adaptamos los estados de tu API ('critico', 'atencion') a la UI
        timeLeft: item.tiempo_restante_str || `${item.dias_para_agotarse}d`,
        timeLeftMinutes: item.dias_para_agotarse * 24 * 60, // Para poder ordenar
        depletionDate: item.fecha_agotamiento_estimada || "Próximamente",
        status: item.estado_forecast || "estable",
        impactLevel: item.dias_para_agotarse < 2 ? "Muy Alto" : (item.dias_para_agotarse < 5 ? "Alto" : "Medio")
      }));

      setSupplies(mappedData);
    } catch (error) {
      console.error("Error fetching forecast:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, []);

  // Filtrado y ordenamiento de datos reales
  const criticalSupplies = supplies.filter((s) => s.status === "critico");
  const warningSupplies = supplies.filter((s) => s.status === "atencion");
  const allSorted = [...supplies].sort((a, b) => a.timeLeftMinutes - b.timeLeftMinutes);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ───────────────── SECTION 1: HEADER + KPIs ───────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.2 }}>
                Careforecast
              </h1>
              <Badge className="bg-slate-900 text-slate-100 border-transparent hover:bg-slate-800" style={{ fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                RIVER ML · HOEFFDING TREE
              </Badge>
            </div>
            <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.875rem" }}>
              Motor de Online Machine Learning. Detecta agotamientos antes de que ocurran.
            </p>
          </div>
        </div>
        <Button
          onClick={fetchForecastData}
          variant="outline"
          className="gap-2 cursor-pointer shrink-0"
          disabled={isRefreshing || loading}
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Actualizando..." : "Actualizar"}
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="gap-0 p-4 border-2">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-500 font-medium" style={{ fontSize: "0.75rem" }}>Monitoreados</p>
                <p className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1 }}>
                  {loading ? "-" : supplies.length}
                </p>
              </div>
            </div>
            <p className="text-slate-400 mt-2" style={{ fontSize: "0.6875rem" }}>Insumos activos en modelo IA</p>
          </CardContent>
        </Card>

        <Card className="gap-0 p-4 border-2 border-red-200 bg-red-50/30">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
              </div>
              <div>
                <p className="text-red-500 font-medium" style={{ fontSize: "0.75rem" }}>Alertas</p>
                <p className="text-red-700" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1 }}>
                  {loading ? "-" : criticalSupplies.length}
                </p>
              </div>
            </div>
            <p className="text-red-400 mt-2" style={{ fontSize: "0.6875rem" }}>Insumos en riesgo de agotamiento</p>
          </CardContent>
        </Card>

        <Card className="gap-0 p-4 border-2 border-amber-200 bg-amber-50/30">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-amber-600 font-medium" style={{ fontSize: "0.75rem" }}>En Atención</p>
                <p className="text-amber-700" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1 }}>
                  {loading ? "-" : warningSupplies.length}
                </p>
              </div>
            </div>
            <p className="text-amber-500 mt-2" style={{ fontSize: "0.6875rem" }}>Requieren reabastecimiento pronto</p>
          </CardContent>
        </Card>

        <Card className="gap-0 p-4 border-2 border-red-300 bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-red-600 font-medium" style={{ fontSize: "0.75rem" }}>Estado IA</p>
                <p className="text-red-700" style={{ fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.15 }}>
                  {loading ? "Analizando..." : (criticalSupplies.length > 0 ? "Crisis de Abasto" : "Operativo Sano")}
                </p>
              </div>
            </div>
            <p className="text-red-500 mt-2" style={{ fontSize: "0.6875rem" }}>Diagnóstico actual del modelo</p>
          </CardContent>
        </Card>
      </div>

      {/* ───────────────── SECTION 2: TWO COLUMNS ───────────────── */}
      {!loading && supplies.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* LEFT: Timeline de Riesgo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-slate-900 flex items-center gap-2" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  Timeline de Riesgo
                </h2>
                <p className="text-slate-500 mt-0.5" style={{ fontSize: "0.8125rem" }}>
                  Insumos con agotamiento inminente que requieren acción
                </p>
              </div>
            </div>

            {criticalSupplies.length === 0 && (
              <div className="p-8 text-center border-2 border-dashed border-emerald-200 rounded-xl bg-emerald-50 text-emerald-600">
                ¡Excelente! No hay alertas críticas en el inventario por ahora.
              </div>
            )}

            {criticalSupplies.slice(0, 3).map((supply) => {
              const SupplyIcon = supply.icon;
              return (
                <Card key={supply.id} className="gap-0 border-2 border-red-200 bg-gradient-to-br from-white to-red-50/40 overflow-hidden relative shadow-sm">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500" />
                  <CardContent className="p-5 pl-7">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                          <SupplyIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-slate-900" style={{ fontSize: "1rem", fontWeight: 600 }}>{supply.name}</p>
                          <p className="text-slate-500" style={{ fontSize: "0.75rem" }}>{supply.category}</p>
                        </div>
                      </div>
                      <Badge className="bg-red-600 text-white border-transparent shadow-sm">
                        <Flame className="w-3 h-3 mr-1" />
                        CRÍTICO
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center shadow-sm">
                        <p className="text-slate-400 mb-1 font-medium" style={{ fontSize: "0.6875rem" }}>Stock Actual</p>
                        <p className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1 }}>{supply.stock}</p>
                        <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.625rem" }}>{supply.unit}</p>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center shadow-sm">
                        <p className="text-slate-400 mb-1 font-medium" style={{ fontSize: "0.6875rem" }}>Consumo/Día</p>
                        <p className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1 }}>{supply.consumptionPerDay}</p>
                        <p className="text-slate-400 mt-0.5" style={{ fontSize: "0.625rem" }}>{supply.unit}/día</p>
                      </div>
                      <div className="bg-red-600 rounded-xl p-3.5 text-center shadow-md">
                        <p className="text-red-200 mb-1 font-medium" style={{ fontSize: "0.6875rem" }}>Agotamiento IA</p>
                        <p className="text-white" style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1.1 }}>{supply.timeLeft}</p>
                        <p className="text-red-200 mt-0.5" style={{ fontSize: "0.625rem" }}>estimado</p>
                      </div>
                    </div>

                    <p className="text-red-500 mt-3 text-center font-medium" style={{ fontSize: "0.75rem" }}>
                      Fecha de agotamiento: {supply.depletionDate}
                    </p>

                    <Button className="w-full mt-4 bg-[#DA291C] hover:bg-[#b8221a] text-white gap-2 cursor-pointer h-10 shadow-sm font-medium">
                      <Zap className="w-4 h-4" />
                      Solicitar Abastecimiento Urgente
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* RIGHT: Real-Time Supply List */}
          <div>
            <Card className="gap-0 h-full flex flex-col border-2 shadow-sm">
              <CardHeader className="pb-3 shrink-0 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-slate-400" />
                      Insumos en Tiempo Real
                    </CardTitle>
                    <CardDescription style={{ fontSize: "0.8125rem" }}>
                      Ordenado por urgencia de reabastecimiento
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full border border-slate-200">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-slate-600" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>Live</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3 flex-1 overflow-hidden">
                <ScrollArea className="h-[550px] pr-4">
                  <div className="space-y-2">
                    {allSorted.map((supply) => {
                      const SupplyIcon = supply.icon;
                      const cfg = statusConfig[supply.status] || statusConfig.estable;
                      const isCritical = supply.status === "critico";
                      return (
                        <div key={supply.id} className={cn("flex items-center gap-3 p-3 rounded-xl transition-colors border", isCritical ? "bg-red-50/70 border-red-100" : "bg-white border-slate-100 hover:bg-slate-50")}>
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", isCritical ? "bg-red-100" : "bg-amber-50")}>
                            {isCritical ? <Flame className="w-4 h-4 text-red-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("truncate", isCritical ? "text-red-800" : "text-slate-800")} style={{ fontSize: "0.875rem", fontWeight: 600 }}>{supply.name}</p>
                            <p className="text-slate-500 truncate" style={{ fontSize: "0.6875rem" }}>{supply.category}</p>
                          </div>
                          <Badge className={cn("border-transparent text-white shrink-0 shadow-sm", cfg.badgeBg)} style={{ fontSize: "0.6875rem", fontWeight: 700, minWidth: "2.5rem", justifyContent: "center" }}>
                            {supply.timeLeft}
                          </Badge>
                          <div className="text-right shrink-0 w-16">
                            <p className="text-slate-700" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{supply.stock}</p>
                            <p className="text-slate-400" style={{ fontSize: "0.5625rem" }}>{supply.unit}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ───────────────── SECTION 3: FULL-WIDTH DATA TABLE ───────────────── */}
      {!loading && supplies.length > 0 && (
        <Card className="gap-0 border-2 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                  Proyección Analítica Continua
                </CardTitle>
                <CardDescription style={{ fontSize: "0.8125rem" }}>
                  Datos completos del modelo predictivo · Agrupado por urgencia
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-slate-600 bg-slate-50">
                {supplies.length} registros
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b-2 border-slate-200">
                    <TableHead className="text-slate-600 font-bold" style={{ fontSize: "0.75rem" }}>Insumo</TableHead>
                    <TableHead className="text-slate-600 font-bold" style={{ fontSize: "0.75rem" }}>Estado</TableHead>
                    <TableHead className="text-slate-600 font-bold text-right" style={{ fontSize: "0.75rem" }}>Stock Actual</TableHead>
                    <TableHead className="text-slate-600 font-bold text-right" style={{ fontSize: "0.75rem" }}>Consumo/Día</TableHead>
                    <TableHead className="text-slate-600 font-bold text-center" style={{ fontSize: "0.75rem" }}>Tiempo Crítico (IA)</TableHead>
                    <TableHead className="text-slate-600 font-bold" style={{ fontSize: "0.75rem" }}>Fecha Agotamiento</TableHead>
                    <TableHead className="text-slate-600 font-bold text-center" style={{ fontSize: "0.75rem" }}>Impacto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>

                  {/* CRITICAL GROUP */}
                  {criticalSupplies.length > 0 && (
                    <TableRow className="hover:bg-transparent bg-red-50/50">
                      <TableCell colSpan={7} className="py-3 px-4 border-l-4 border-l-red-500">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-red-500" />
                          <span className="text-red-700" style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                            URGENCIA CRÍTICA — ACCIÓN INMEDIATA REQUERIDA
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {criticalSupplies.map((s) => <SupplyTableRow key={s.id} supply={s} />)}

                  {/* WARNING GROUP */}
                  {warningSupplies.length > 0 && (
                    <TableRow className="hover:bg-transparent bg-amber-50/50">
                      <TableCell colSpan={7} className="py-3 px-4 border-l-4 border-l-amber-400">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-700" style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                            EN ATENCIÓN — MONITOREAR DE CERCA
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {warningSupplies.map((s) => <SupplyTableRow key={s.id} supply={s} />)}

                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Table Row Sub-Component ── */
function SupplyTableRow({ supply }: { supply: any }) {
  const SupplyIcon = supply.icon;
  const cfg = statusConfig[supply.status] || statusConfig.estable;
  const impact = impactConfig[supply.impactLevel] || "";

  return (
    <TableRow className={cn("border-b border-slate-100 transition-colors hover:bg-slate-50", supply.status === "critico" && "bg-red-50/20")}>
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", cfg.bg, cfg.border && `border ${cfg.border}`)}>
            <SupplyIcon className={cn("w-4.5 h-4.5", cfg.color)} />
          </div>
          <div>
            <p className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>{supply.name}</p>
            <p className="text-slate-500" style={{ fontSize: "0.6875rem", fontWeight: 500 }}>{supply.category}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn("border-transparent text-white shadow-sm", cfg.badgeBg)} style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
          {cfg.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-900" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>{supply.stock}</span>
        <span className="text-slate-500 ml-1" style={{ fontSize: "0.6875rem", fontWeight: 500 }}>{supply.unit}</span>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 600 }}>{supply.consumptionPerDay}</span>
        <span className="text-slate-400 ml-0.5" style={{ fontSize: "0.6875rem" }}>/{supply.unit.replace("uds", "ud").replace("frascos", "fr").replace("latas", "lt")}</span>
      </TableCell>
      <TableCell className="text-center">
        <span className={cn("inline-flex items-center justify-center px-3 py-1 rounded-full text-white shadow-sm", supply.status === "critico" ? "bg-red-600" : "bg-amber-500")} style={{ fontSize: "0.8125rem", fontWeight: 700, minWidth: "3.5rem" }}>
          {supply.timeLeft}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-slate-600 font-medium" style={{ fontSize: "0.8125rem" }}>{supply.depletionDate}</span>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={cn(impact, "font-semibold bg-transparent")} style={{ fontSize: "0.6875rem" }}>
          {supply.impactLevel}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
