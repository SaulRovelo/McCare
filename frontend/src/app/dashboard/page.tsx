"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Heart, Target, Users, TrendingUp, ArrowRight, Package, Calendar, Bell } from "lucide-react"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAdminResumen, getMovimientosGlobales, getForecast } from "@/services/api"

const accionesRapidas = [
  {
    title: "CareForecast",
    description: "Predicciones de inventario con IA",
    href: "/dashboard/forecast",
    icon: TrendingUp,
    badge: "IA",
  },
  {
    title: "Inventario",
    description: "Gestionar existencias actuales",
    href: "/dashboard/inventario",
    icon: Package,
  },
  {
    title: "Familias",
    description: "Gestión de residentes y necesidades",
    href: "/dashboard/familias",
    icon: Users,
  },
  {
    title: "Donaciones",
    description: "Rastrear donaciones entrantes",
    href: "/dashboard/donaciones",
    icon: Heart,
  },
  {
    title: "Agenda",
    description: "Próximas entregas y eventos",
    href: "/dashboard/agenda",
    icon: Calendar,
  },
]

const actividadMock = [
  {
    id: "1",
    type: "donation",
    message: "Donante Anónimo aportó 250 MXN para artículos de cuidado infantil",
    time: "Hace 2 horas",
  },
  {
    id: "2",
    type: "alert",
    message: "Alerta de inventario: Pañales (Talla 3) por debajo del mínimo",
    time: "Hace 4 horas",
  },
  {
    id: "3",
    type: "donation",
    message: "Familia Smith donó artículos básicos valorados en 180 MXN",
    time: "Hace 6 horas",
  },
  {
    id: "4",
    type: "milestone",
    message: "Meta de donación mensual alcanzada: 10,000 MXN",
    time: "Hace 1 día",
  },
]

import { getSessionUser } from "@/lib/auth"

export default function DashboardPage() {
  const [resumen, setResumen] = useState<any>(null)
  const [movimientos, setMovimientos] = useState<any[]>([])
  const [forecasts, setForecasts] = useState<any[]>([])

  useEffect(() => {
    const user = getSessionUser()
    const sedeUser = user?.sede || "cdmx"
    
    getAdminResumen(sedeUser).then(setResumen).catch(console.error)
    getMovimientosGlobales(4, sedeUser).then(setMovimientos).catch(console.error)
    getForecast(20, sedeUser).then(setForecasts).catch(console.error)
  }, [])

  const isLoading = !resumen;

  // Lógica Predictiva (IA visual CareForecast)
  const forecastAlertas = forecasts.filter(f => f.estado_forecast === "critico" || f.estado_forecast === "atencion");
  const countAlertas = forecastAlertas.length;
  // Identificar la categoría peor perfilada
  const cats: Record<string, number> = {};
  forecastAlertas.forEach(f => cats[f.categoria] = (cats[f.categoria] || 0) + 1);
  const peorCategoria = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0] || "generales";

  const dataResumen = resumen || {
    estado_general: "optimo",
    cobertura_promedio_dias: 0,
    misiones_activas: 8,
    total_insumos: 156,
    insumos_criticos: 24,
    insumos_atencion: 0,
    porcentaje_catalogo_sano: 0
  }

  // Graceful degradation para Actividad
  const historyToRender = movimientos.length > 0
    ? movimientos.map(m => {
      const isEntrada = m.tipo_movimiento === "entrada";
      let obs = m.observacion || "Operación regular";
      if(isEntrada) {
        if(obs.includes("Donación general inteligente")) {
            const match = obs.match(/\$([0-9.]+)/);
            const amount = match ? parseFloat(match[1]).toLocaleString('es-MX') : "0";
            obs = `Aporte Web redireccionado a ítem crítico ($${amount} MXN)`;
        } else if(obs === "Equipamiento Especial Local") {
            obs = "Donación en Especie en Sede";
        } else if (obs.toLowerCase().includes("reabastecimiento") || obs.toLowerCase().includes("publico")) {
            obs = "Donación Directa en Mostrador";
        }
      }
      return {
        id: m.id,
        type: isEntrada ? "donation" : (m.tipo_movimiento === "ajuste" ? "milestone" : "alert"),
        message: isEntrada
          ? `Ingreso de Insumo (+${m.cantidad} uds) — ${obs}`
          : `Despacho / Salida (-${m.cantidad} uds) — ${obs}`,
        time: new Date(m.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
      };
    })
    : actividadMock;

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          ¡Bienvenido de nuevo! Aquí tienes un resumen de las operaciones de la Casa Ronald McDonald.
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Cobertura Promedio"
          value={isLoading ? "..." : `${dataResumen.cobertura_promedio_dias} días`}
          description="de margen en almacén"
          icon={Heart}
          variant="primary"
          trend={{ value: Number(dataResumen.porcentaje_catalogo_sano), isPositive: true }}
        />
        <StatsCard
          title="Misiones Activas"
          value={isLoading ? "..." : String(dataResumen.misiones_activas)}
          description="demandas vigentes"
          icon={Target}
          variant="warning"
        />
        <StatsCard
          title="Catálogo Total"
          value={isLoading ? "..." : String(dataResumen.total_insumos)}
          description="insumos registrados"
          icon={Users}
          variant="default"
        />
        <StatsCard
          title="Alertas Activas"
          value={isLoading ? "..." : String(dataResumen.insumos_criticos + dataResumen.insumos_atencion)}
          description="solicitudes de urgencia"
          icon={Package}
          variant="danger"
        />
      </div>

      {/* Acciones Rápidas (MODERNIZADAS) */}
      <h2 className="text-[1.1rem] font-bold text-slate-800 tracking-tight mt-1 mb-[-1rem]">Accesos Institucionales</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {accionesRapidas.map((accion) => (
          <Link key={accion.href} href={accion.href}>
            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer group flex flex-col border border-slate-200 hover:border-emerald-200 overflow-hidden relative bg-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-3 relative z-10 px-5 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 group-hover:bg-emerald-50 transition-colors shadow-sm border border-slate-100 group-hover:border-emerald-100">
                    <accion.icon className="h-6 w-6 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  {accion.badge && (
                    <Badge className="bg-[#FFBC0D] text-foreground shadow-sm px-2 py-0 border-none font-bold tracking-wider" style={{ fontSize: "0.65rem" }}>
                      {accion.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="relative z-10 px-5 pb-5 pt-0">
                <CardTitle className="text-[0.95rem] font-extrabold mb-1.5 text-slate-800 group-hover:text-emerald-700 transition-colors">{accion.title}</CardTitle>
                <CardDescription className="text-xs text-slate-500 leading-relaxed font-medium">
                  {accion.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Actividad Reciente y Alertas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Actividad Reciente */}
        <Card className="shadow-sm border-border/50 h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Flujo de Operación Reciente</CardTitle>
              <CardDescription>Auditoría de tu sede en tiempo real</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex flex-col gap-5 mt-2">
              {historyToRender.map((actividad) => (
                <div
                  key={actividad.id}
                  className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${actividad.type === "donation"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : actividad.type === "alert"
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                  >
                    {actividad.type === "donation" ? (
                      <Heart className="h-5 w-5" />
                    ) : actividad.type === "alert" ? (
                      <Package className="h-5 w-5" />
                    ) : (
                      <Target className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <p className="text-sm font-medium text-slate-800 leading-snug">{actividad.message}</p>
                    <span className="text-[0.7rem] font-bold tracking-widest text-slate-400 uppercase">
                      {actividad.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {historyToRender.length > 0 && typeof historyToRender[0].id === "string" && historyToRender[0].id.length > 5 && (
              <div className="mt-4 pt-4 border-t border-slate-100 w-full flex justify-center">
                 <Link href="/dashboard/donaciones" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                    Ver bitácora completa <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vista Previa de CareForecast */}
        <Card className="shadow-sm border-border/50 bg-gradient-to-br from-background to-muted/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Previsión CareForecast</CardTitle>
              <Badge className="bg-[#FFBC0D] text-foreground">IA</Badge>
            </div>
            <CardDescription>
              Predictiva impulsada por IA para el abastecimiento
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg border border-[#DB0007]/20 bg-[#DB0007]/5 p-4">
              <div className="flex items-center gap-2 text-[#DB0007] font-semibold mb-2">
                <TrendingUp className="h-4 w-4" />
                {countAlertas > 0 ? "Alerta Detectada" : "Operación Estable"}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isLoading ? (
                  "Analizando datos de la plataforma..."
                ) : countAlertas > 0 ? (
                  <>
                    Se prevé que <span className="font-medium text-foreground">{countAlertas} insumos</span> alcancen un
                    nivel crítico o de atención a la brevedad. Los productos de la categoría <span className="font-medium uppercase">{peorCategoria}</span> muestran
                    alta urgencia derivada del comportamiento histórico de salidas.
                  </>
                ) : (
                  <>
                    Ningún escenario de abasto luce en riesgo crítico. El catálogo es proyectado de
                    manera <span className="font-medium text-foreground">estable</span> dentro de los flujos de distribución previstos.
                  </>
                )}
              </p>
            </div>
            <Link href="/dashboard/forecast">
              <Button className="w-full bg-[#DB0007] hover:bg-[#DB0007]/90 text-white">
                Ver pronóstico completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
