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

function formatCriticalTime(criticalDays: number) {
  if (criticalDays <= 0) return "En Crisis";
  if (criticalDays <= 3) return "Riesgo Inminente";
  if (criticalDays <= 7) return "Atención Prioritaria";
  return "Monitoreo Preventivo";
}

function formatDepletionTime(days: number) {
  if (days <= 0.5) return "Se agota hoy";
  if (days <= 1.5) return "Se agota mañana";
  return `Se agota en ${Math.round(days)} días`;
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
        // dias_para_nivel_critico = mismo dato que usa el sistema de misiones (es el tiempo real de acción)
        // dias_para_agotarse = solo informativo (cuándo llega a cero total)
        const criticalDays = item.dias_para_nivel_critico ?? 0;
        const agotarseDays = item.dias_para_agotarse ?? 0;

        const depletionDate = new Date();
        depletionDate.setDate(depletionDate.getDate() + Math.floor(agotarseDays));

        const criticalDate = new Date();
        criticalDate.setDate(criticalDate.getDate() + Math.floor(criticalDays));

        const impactLevel = item.estado_forecast === "critico" ? "Muy Alto" : (item.estado_forecast === "atencion" ? "Alto" : "Medio");
        
        return {
          id: item.id || Math.random().toString(),
          name: item.nombre || item.insumo_nombre || "Insumo Desconocido",
          category: item.categoria || "General",
          icon: getIconForCategory(item.nombre || ""),
          stock: item.stock_actual || 0,
          nivel_critico: item.nivel_critico || 0,
          unit: item.unidad_medida || "uds",
          consumptionPerDay: item.consumo_estimado || 0,
          // Tiempo hasta zona crítica (=mismo que misiones)
          timeLeft: formatCriticalTime(criticalDays),
          timeLeftMinutes: criticalDays * 24 * 60,
          // Tiempo hasta agotarse total (secundario, informativo)
          depletionText: formatDepletionTime(agotarseDays),
          criticalDays,
          agotarseDays,
          status: item.estado_forecast || "estable",
          unitsNeeded: Math.ceil(unitsNeeded),
          totalCost,
          currentStockValue: item.stock_actual * cost,
          depletionDate: depletionDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
          criticalDate: criticalDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
          impactLevel,
          sede: item.sede || "cdmx"
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

      {/* ───────────────── SECTION 2: INSUMOS EN TIEMPO REAL ───────────────── */}
      {!loading && supplies.length > 0 && (
        <Card className="gap-0 border-2 shadow-sm">
          <CardHeader className="pb-3 shrink-0 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-slate-400" />
                  Insumos en Tiempo Real
                </CardTitle>
                <CardDescription style={{ fontSize: "0.8125rem" }}>
                  Ordenado por urgencia de reabastecimiento · <span className="font-semibold text-slate-600">{supplies.length} insumos</span> monitoreados por IA
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Crítico</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Atención</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Estable</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-full border border-slate-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-slate-600" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>Live</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <ScrollArea className="h-[440px] pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {allSorted.map((supply) => {
                  const SupplyIcon = supply.icon;
                  const cfg = statusConfig[supply.status] || statusConfig.estable;
                  const isCritical = supply.status === "critico";
                  const isWarning = supply.status === "atencion";
                  const isStable = !isCritical && !isWarning;
                  // Stock progress: how much of the critical level is covered
                  const stockRatio = supply.nivel_critico > 0
                    ? Math.min(100, Math.round((supply.stock / supply.nivel_critico) * 100))
                    : 100;
                  const barColor = isCritical ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-emerald-400";
                  const cardBg = isCritical
                    ? "bg-gradient-to-br from-red-50 to-rose-50/40 border-red-200 hover:border-red-300"
                    : isWarning
                    ? "bg-gradient-to-br from-amber-50/60 to-orange-50/20 border-amber-200 hover:border-amber-300"
                    : "bg-white border-slate-100 hover:border-slate-200";

                  return (
                    <div
                      key={supply.id}
                      className={cn("rounded-xl border p-3.5 transition-all duration-200 hover:shadow-md", cardBg)}
                    >
                      {/* Row 1: Icon + Name + Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isCritical ? "bg-red-100" : isWarning ? "bg-amber-100" : "bg-slate-100"
                          )}>
                            {isCritical
                              ? <Flame className="w-4 h-4 text-red-500" />
                              : isWarning
                              ? <AlertTriangle className="w-4 h-4 text-amber-500" />
                              : <SupplyIcon className="w-4 h-4 text-slate-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("font-semibold leading-tight truncate", isCritical ? "text-red-900" : "text-slate-800")} style={{ fontSize: "0.875rem" }}>
                              {supply.name}
                            </p>
                            <p className="text-slate-400 truncate" style={{ fontSize: "0.625rem", fontWeight: 500 }}>
                              {supply.category} · {supply.sede?.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={cn("border-transparent text-white shadow-sm whitespace-nowrap shrink-0 text-[0.6rem] font-bold", cfg.badgeBg)}
                        >
                          {supply.timeLeft}
                        </Badge>
                      </div>

                      {/* Row 2: Stock progress bar */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-500 font-medium" style={{ fontSize: "0.6rem", letterSpacing: "0.03em" }}>
                            STOCK vs NIVEL CRÍTICO
                          </span>
                          <span className={cn("font-bold", isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-emerald-600")} style={{ fontSize: "0.6875rem" }}>
                            {stockRatio}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", barColor)}
                            style={{ width: `${stockRatio}%` }}
                          />
                        </div>
                      </div>

                      {/* Row 3: Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div>
                            <p className="text-slate-400" style={{ fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase" }}>Stock</p>
                            <p className={cn("font-bold", isCritical ? "text-red-700" : "text-slate-700")} style={{ fontSize: "0.8125rem" }}>
                              {supply.stock} <span className="text-slate-400 font-normal text-[0.6rem]">{supply.unit}</span>
                            </p>
                          </div>
                          <div className="w-px h-6 bg-slate-200" />
                          <div>
                            <p className="text-slate-400" style={{ fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase" }}>Crít.</p>
                            <p className="text-slate-500 font-semibold" style={{ fontSize: "0.8125rem" }}>
                              {supply.nivel_critico} <span className="text-slate-400 font-normal text-[0.6rem]">{supply.unit}</span>
                            </p>
                          </div>
                          <div className="w-px h-6 bg-slate-200" />
                          <div>
                            <p className="text-slate-400" style={{ fontSize: "0.55rem", fontWeight: 600, textTransform: "uppercase" }}>Ritmo</p>
                            <p className="text-slate-600 font-semibold" style={{ fontSize: "0.8125rem" }}>
                              {supply.consumptionPerDay?.toFixed(1)}<span className="text-slate-400 font-normal text-[0.6rem]">/d</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-700 font-bold" style={{ fontSize: "0.8125rem" }}>
                            {(supply.currentStockValue || 0).toLocaleString('es-MX')}
                          </p>
                          <p className="text-slate-400 font-semibold" style={{ fontSize: "0.55rem" }}>MXN</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
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

  return (
    <TableRow className={cn("border-b border-slate-100 transition-colors hover:bg-slate-50", supply.status === "critico" && "bg-red-50/20")}>
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm", cfg.bg, cfg.border && `border ${cfg.border}`)}>
            <SupplyIcon className={cn("w-4.5 h-4.5", cfg.color)} />
          </div>
          <div>
            <p className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 600 }}>{supply.name}</p>
            <p className="text-slate-400" style={{ fontSize: "0.6875rem", fontWeight: 500 }}>
              {supply.category} · <span className="uppercase">{supply.sede}</span>
            </p>
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
            {supply.stock} / crít. {supply.nivel_critico} {supply.unit}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-700" style={{ fontSize: "0.875rem", fontWeight: 600 }}>{supply.consumptionPerDay?.toFixed(2)}</span>
        <span className="text-slate-400 ml-0.5" style={{ fontSize: "0.6875rem" }}>/{supply.unit || "ud"}</span>
      </TableCell>
      {/* Tiempo crítico — MISMO que el donante ve en las misiones */}
      <TableCell className="text-center">
        <div className="flex flex-col items-center gap-0.5">
          <span className={cn("inline-flex items-center justify-center px-3 py-1 rounded-full text-white shadow-sm whitespace-nowrap", supply.status === "critico" ? "bg-red-600" : "bg-amber-500")} style={{ fontSize: "0.8125rem", fontWeight: 700, minWidth: "4.5rem" }}>
            {supply.timeLeft}
          </span>
          <span className="text-slate-400 text-[0.6rem]">{supply.criticalDate}</span>
        </div>
      </TableCell>
      {/* Fecha agotamiento total */}
      <TableCell>
        <div className="flex flex-col">
          <span className="text-slate-600 font-medium" style={{ fontSize: "0.8125rem" }}>{supply.depletionDate}</span>
          <span className="text-slate-400" style={{ fontSize: "0.65rem" }}>{supply.depletionText}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold shadow-sm whitespace-nowrap" style={{ fontSize: "0.75rem" }}>
          ${supply.totalCost.toLocaleString('es-MX')} MXN
        </Badge>
      </TableCell>
    </TableRow>
  );
}