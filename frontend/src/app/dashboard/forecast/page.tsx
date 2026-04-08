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
import { getForecast, getInsumos } from "@/services/api";
import { getSessionUser } from "@/lib/auth";

/* ═══════════════════════════════════════════════════
   HELPERS & FORMATTING
   ═══════════════════════════════════════════════════ */

function formatHumanTime(days: number) {
  if (days <= 0.5) return "Se agota hoy";
  if (days <= 1.5) return "Se agota mañana";
  return `En ${Math.round(days)} días`;
}

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
  const [sedeActiva, setSedeActiva] = useState("cdmx");

  const fetchForecastData = async () => {
    setIsRefreshing(true);
    try {
      const user = getSessionUser();
      const sedeUser = user?.sede || "cdmx";
      setSedeActiva(sedeUser);

      const [data, insumosData] = await Promise.all([
        getForecast(50, sedeUser),
        getInsumos(sedeUser)
      ]);

      const mappedData = data.map((item: any) => {
        const matchingInsumo = insumosData.find((i: any) => String(i.id) === String(item.id)) || {};
        const cost = matchingInsumo.costo_unitario || 0;
        const maxCap = matchingInsumo.capacidad_maxima || 100;
        const unitsNeeded = maxCap > item.stock_actual ? (maxCap - item.stock_actual) : maxCap;
        const totalCost = unitsNeeded * cost;
        const rawDays = item.dias_para_agotarse;
        
        return {
          id: item.id || Math.random().toString(),
          name: item.nombre || item.insumo_nombre || "Insumo Desconocido",
          category: item.categoria || "General",
          icon: getIconForCategory(item.nombre || ""),
          stock: item.stock_actual || 0,
          unit: item.unidad_medida || "uds",
          consumptionPerDay: item.consumo_diario_estimado || 0,
          timeLeft: formatHumanTime(rawDays),
          timeLeftMinutes: rawDays * 24 * 60,
          status: item.estado_forecast || "estable",
          unitsNeeded: Math.ceil(unitsNeeded),
          totalCost,
          currentStockValue: item.stock_actual * cost
        };
      });

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
                CareForecast ({sedeActiva.toUpperCase()})
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
                <Card key={supply.id} className="gap-0 border-2 border-red-200 overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-600" />
                  <CardContent className="p-4 pl-5">
                    {/* NIVEL 1: ESTADO Y HEADLINE */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                          <SupplyIcon className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-slate-900 leading-tight" style={{ fontSize: "0.95rem", fontWeight: 700 }}>{supply.name}</p>
                          <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>{supply.category}</p>
                        </div>
                      </div>
                      <Badge className="bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm px-1.5 py-0.5" style={{ fontSize: "0.65rem" }}>
                        <Flame className="w-3 h-3 mr-1" />
                        CRÍTICO
                      </Badge>
                    </div>

                    {/* NIVEL 2: DECISIÓN (IMPACTO Y COSTO PRINCIPAL) */}
                    <div className="bg-gradient-to-br from-red-50 to-rose-50/50 rounded-lg border border-red-100/60 p-3 text-center mb-3">
                       <p className="text-red-700 font-extrabold text-lg tracking-tight mb-2 drop-shadow-sm">
                          {supply.timeLeft}
                       </p>
                       <div className="flex flex-col gap-1.5 mt-1">
                         <div className="flex justify-between items-center text-xs px-1">
                           <span className="text-slate-500 font-medium tracking-wide">Cobertura requerida:</span>
                           <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded shadow-sm">{supply.unitsNeeded} {supply.unit}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs px-1">
                           <span className="text-slate-500 font-medium tracking-wide">Inversión est:</span>
                           <span className="text-emerald-700 font-black bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded shadow-sm">
                             {supply.totalCost.toLocaleString('es-MX')} MXN
                           </span>
                         </div>
                       </div>
                    </div>

                    {/* NIVEL 3: DATOS TÉCNICOS VISUALMENTE MENORES */}
                    <div className="flex justify-between items-center px-3 mb-1 rounded-md bg-slate-50 border border-slate-100 py-1.5">
                        <p className="text-[0.65rem] uppercase text-slate-500 font-semibold tracking-wider">
                          Stock: <span className="text-slate-800 font-bold">{supply.stock}</span> {supply.unit}
                        </p>
                        <div className="h-3 w-px bg-slate-200"></div>
                        <p className="text-[0.65rem] uppercase text-slate-500 font-semibold tracking-wider">
                          Ritmo: <span className="text-slate-800 font-bold">{supply.consumptionPerDay}</span> /día
                        </p>
                    </div>

                    {/* NIVEL 4: ACCIÓN REMOVIDO A PETICIÓN DE USUARIO */}
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
                          <Badge className={cn("border-transparent text-white shrink-0 shadow-sm whitespace-nowrap px-2 px-x px-2", cfg.badgeBg)} style={{ fontSize: "0.6875rem", fontWeight: 700, minWidth: "4.5rem", justifyContent: "center" }}>
                            {supply.timeLeft}
                          </Badge>
                          <div className="text-right shrink-0 min-w-[5rem]">
                            <p className="text-emerald-700" style={{ fontSize: "0.8125rem", fontWeight: 700 }}>{(supply.currentStockValue || 0).toLocaleString('es-MX')}</p>
                            <p className="text-slate-400" style={{ fontSize: "0.5625rem", fontWeight: 600 }}>MXN</p>
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
                    <TableHead className="text-slate-600 font-bold text-right" style={{ fontSize: "0.75rem" }}>Valor Stock</TableHead>
                    <TableHead className="text-slate-600 font-bold text-right" style={{ fontSize: "0.75rem" }}>Consumo/Día</TableHead>
                    <TableHead className="text-slate-600 font-bold text-center" style={{ fontSize: "0.75rem" }}>Tiempo Crítico (IA)</TableHead>
                    <TableHead className="text-slate-600 font-bold" style={{ fontSize: "0.75rem" }}>Fecha Agotamiento</TableHead>
                    <TableHead className="text-slate-600 font-bold text-center" style={{ fontSize: "0.75rem" }}>Inversión MXN</TableHead>
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
        <div className="flex flex-col items-end">
          <span className="text-emerald-700" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
            ${(supply.currentStockValue || 0).toLocaleString('es-MX')} MXN
          </span>
          <span className="text-slate-400" style={{ fontSize: "0.6875rem", fontWeight: 500 }}>
            {supply.stock} {supply.unit}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 600 }}>{supply.consumptionPerDay}</span>
        <span className="text-slate-400 ml-0.5" style={{ fontSize: "0.6875rem" }}>/{supply.unit.replace("uds", "ud").replace("frascos", "fr").replace("latas", "lt")}</span>
      </TableCell>
      <TableCell className="text-center">
        <span className={cn("inline-flex items-center justify-center px-3 py-1 rounded-full text-white shadow-sm whitespace-nowrap", supply.status === "critico" ? "bg-red-600" : "bg-amber-500")} style={{ fontSize: "0.8125rem", fontWeight: 700, minWidth: "4.5rem" }}>
          {supply.timeLeft}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-slate-600 font-medium" style={{ fontSize: "0.8125rem" }}>{supply.depletionDate}</span>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold shadow-sm whitespace-nowrap" style={{ fontSize: "0.75rem" }}>
          ${supply.totalCost.toLocaleString('es-MX')} MXN
        </Badge>
      </TableCell>
    </TableRow>
  );
}