"use client"

import { useEffect, useState } from "react"
import { getForecast } from "@/services/api"
import {
  Award, Heart, CheckCircle2, TrendingUp, Sparkles,
  Home, Shield, Clock, ArrowRight, Star, Zap
} from "lucide-react"

// Datos de historial del filántropo
const historialDonaciones = [
  {
    item: "Kits de Admisión Hospitalaria",
    fecha: "2024-11-05",
    icon: "🏥",
    cantidad: 50,
    familias: 50,
    categoria: "Médico",
    monto: "$2,500",
  },
  {
    item: "Leche Maternizada Etapa 1",
    fecha: "2025-01-20",
    icon: "🍼",
    cantidad: 120,
    familias: 30,
    categoria: "Alimentos",
    monto: "$1,800",
  },
  {
    item: "Pañales Prematuro (Caja)",
    fecha: "2025-03-10",
    icon: "🌿",
    cantidad: 80,
    familias: 40,
    categoria: "Cuidado",
    monto: "$3,200",
  },
  {
    item: "Fondo General McCare",
    fecha: "2025-06-15",
    icon: "💛",
    cantidad: 1,
    familias: 100,
    categoria: "General",
    monto: "$10,000",
  },
]

const totalFamilias = historialDonaciones.reduce((s, d) => s + d.familias, 0)
const totalMonto = "$ 17,500"
const nivelDonante = "Platino"

const nivelConfig = {
  Platino: { color: "from-slate-300 to-slate-500", badge: "bg-gradient-to-r from-slate-400 to-slate-600", stars: 5 },
  Oro:     { color: "from-yellow-300 to-amber-500",  badge: "bg-gradient-to-r from-yellow-400 to-amber-600",  stars: 4 },
  Plata:   { color: "from-gray-200 to-gray-400",     badge: "bg-gradient-to-r from-gray-300 to-gray-500",     stars: 3 },
}
const nivel = nivelConfig[nivelDonante as keyof typeof nivelConfig]

export default function PanelDonantePage() {
  const [criticalMissions, setCriticalMissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getForecast(50)
      .then((data) => {
        const criticas = data.filter((f: any) => f.estado_forecast === "critico")
        setCriticalMissions(criticas.slice(0, 3))
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col gap-10 pb-8">

      {/* ── Hero Banner del Donante ───────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0a0a] via-[#2d0808] to-[#DB0007] p-8 text-white shadow-2xl">
        {/* Decoración de fondo */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-32 top-8 h-3 w-3 rounded-full bg-[#FFBC0D] opacity-80" />
        <div className="pointer-events-none absolute right-48 top-20 h-2 w-2 rounded-full bg-white/40" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar / Sello */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
              <Award className="h-10 w-10 text-[#FFBC0D]" />
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white ${nivel.badge} mb-2`}>
                <Shield className="h-3 w-3" />
                Donante {nivelDonante}
                {Array.from({ length: nivel.stars }).map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-white" />
                ))}
              </div>
              <h1 className="text-3xl font-black tracking-tight">Mi Área de Impacto</h1>
              <p className="mt-1 text-white/70 text-sm">Portal exclusivo para colaboradores comprometidos con McCare</p>
            </div>
          </div>

          {/* Resumen rápido en el hero */}
          <div className="flex gap-6 sm:text-right">
            <div>
              <div className="text-3xl font-black text-[#FFBC0D]">{totalFamilias}</div>
              <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Familias</div>
            </div>
            <div className="h-full w-px bg-white/20 self-stretch hidden sm:block" />
            <div>
              <div className="text-3xl font-black">{totalMonto}</div>
              <div className="text-xs text-white/60 font-medium uppercase tracking-wider">Aportado</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tarjetas KPI ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Familias Beneficiadas",
            value: totalFamilias,
            suffix: "",
            icon: Home,
            color: "text-[#DB0007]",
            bg: "bg-rose-50",
            border: "border-rose-100",
            trend: "+12 este año",
            trendPos: true,
          },
          {
            label: "Aportaciones Totales",
            value: historialDonaciones.length,
            suffix: " donaciones",
            icon: Heart,
            color: "text-pink-500",
            bg: "bg-pink-50",
            border: "border-pink-100",
            trend: "Nivel Platino",
            trendPos: true,
          },
          {
            label: "Impacto Acumulado",
            value: totalMonto,
            suffix: " MXN",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-50",
            border: "border-amber-100",
            trend: "Top 5% global",
            trendPos: true,
          },
          {
            label: "Sello ESG",
            value: "Activo",
            suffix: "",
            icon: Award,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            trend: "Cumplimiento 100%",
            trendPos: true,
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className={`rounded-2xl border ${kpi.border} ${kpi.bg} p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex justify-between items-start">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{kpi.label}</p>
              <div className={`rounded-lg p-2 bg-white shadow-sm`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </div>
            <div className={`mt-3 text-3xl font-black ${kpi.color}`}>
              {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
              {typeof kpi.value === "number" && kpi.suffix && (
                <span className="text-base font-medium text-slate-500 ml-1">{kpi.suffix}</span>
              )}
            </div>
            <p className={`mt-2 text-xs font-semibold ${kpi.trendPos ? "text-emerald-600" : "text-rose-500"}`}>
              ↑ {kpi.trend}
            </p>
          </div>
        ))}
      </div>

      {/* ── Misiones Urgentes + Historial ────────────────────────────────── */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">

        {/* Misiones por IA – 2 columnas */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#DB0007]" />
              Misiones Prioritarias
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#DB0007] bg-rose-50 border border-rose-100 rounded-full px-3 py-1">
              CareForecast IA
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-400 shadow-sm">
              <Sparkles className="h-8 w-8 mx-auto mb-3 animate-pulse text-slate-200" />
              Analizando necesidades...
            </div>
          ) : criticalMissions.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center shadow-sm">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-emerald-400" />
              <p className="font-bold text-emerald-700">Inventario Estable</p>
              <p className="text-sm text-emerald-600 mt-1">No hay misiones críticas activas en este momento.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {criticalMissions.map((m, i) => (
                <div
                  key={i}
                  className="group rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-rose-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                        {m.categoria} · Urgencia Crítica
                      </span>
                      <h3 className="font-black text-slate-900 text-base mt-0.5 leading-tight">{m.nombre}</h3>
                    </div>
                    <div className="shrink-0 rounded-xl bg-rose-50 p-2 border border-rose-100">
                      <Zap className="h-4 w-4 text-rose-500" />
                    </div>
                  </div>
                  <p className="text-xs text-rose-600 font-medium mb-4">{m.mensaje_forecast}</p>
                  <button className="w-full rounded-xl bg-[#DB0007] hover:bg-red-800 transition-colors text-white text-sm font-bold py-2.5 flex items-center justify-center gap-2">
                    <Heart className="h-3.5 w-3.5" />
                    Apadrinar Misión
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline de historial – 3 columnas */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" />
              Historial de Contribuciones
            </h2>
            <span className="text-xs text-slate-400 font-medium">Auditoría ESG</span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            {/* Header sutil */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Aportación</span>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Impacto</span>
            </div>

            <div className="divide-y divide-slate-50">
              {historialDonaciones.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-6 py-5 hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Ícono */}
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {d.icon}
                  </div>

                  {/* Detalle */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{d.item}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">
                        {new Date(d.fecha).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                      <span className="text-slate-200">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                        {d.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="shrink-0 text-right">
                    <div className="text-base font-black text-emerald-600">{d.monto}</div>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">
                      {d.familias} familias
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer sello */}
            <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-t border-slate-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFBC0D]/20 border border-[#FFBC0D]/30">
                <Sparkles className="h-4 w-4 text-[#FFBC0D]" />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tus contribuciones están certificadas en la cadena de trazabilidad ESG de McCare. Disponibles para reporte anual de impacto social.
              </p>
              <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Banner CTA ───────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFBC0D] to-amber-400 p-6 shadow-lg">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-300/60 to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-amber-900/70">Siguiente nivel</p>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              ¿Listo para convertirte en Aliado Estratégico?
            </h3>
            <p className="text-sm text-amber-900/80 mt-1">Accede al Portal Corporativo ESG y genera reportes de impacto para tu empresa.</p>
          </div>
          <a
            href="/dashboard/aliados"
            className="shrink-0 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 transition-colors text-white font-bold text-sm rounded-xl px-6 py-3 shadow-md"
          >
            Portal de Aliados
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
