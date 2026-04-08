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
    message: "Donante Anónimo aportó $250 para artículos de cuidado infantil",
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
    message: "Familia Smith donó artículos básicos valorados en $180",
    time: "Hace 6 horas",
  },
  {
    id: "4",
    type: "milestone",
    message: "Meta de donación mensual alcanzada: $10,000",
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
    ? movimientos.map(m => ({
      id: m.id,
      type: m.tipo_movimiento === "entrada" ? "donation" : (m.tipo_movimiento === "ajuste" ? "milestone" : "alert"),
      message: m.tipo_movimiento === "entrada"
        ? `Registro Entrada (+${m.cantidad}): ${m.observacion || 'Origen no especificado'}`
        : `${m.tipo_movimiento.toUpperCase()} (-${m.cantidad}): ${m.observacion || 'Operación de inventario'}`,
      time: new Date(m.fecha).toLocaleDateString()
    }))
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

      {/* Acciones Rápidas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accionesRapidas.map((accion) => (
          <Link key={accion.href} href={accion.href}>
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 cursor-pointer group flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                    <accion.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {accion.badge && (
                    <Badge className="bg-[#FFBC0D] text-foreground">
                      {accion.badge}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-1">{accion.title}</CardTitle>
                <CardDescription className="text-sm">
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
        <Card className="shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Auditoría de almacén y donaciones</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Ver Todo
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {historyToRender.map((actividad) => (
                <div
                  key={actividad.id}
                  className="flex items-start gap-3 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <div
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${actividad.type === "donation"
                      ? "bg-green-100 text-green-600"
                      : actividad.type === "alert"
                        ? "bg-[#DB0007]/10 text-[#DB0007]"
                        : "bg-[#FFBC0D]/20 text-[#FFBC0D]"
                      }`}
                  >
                    {actividad.type === "donation" ? (
                      <Heart className="h-4 w-4" />
                    ) : actividad.type === "alert" ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <Target className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm leading-snug">{actividad.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {actividad.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
