"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Heart,
  Star,
  CalendarDays,
  DollarSign,
  ChevronRight,
  Download,
  FileText,
  ArrowRight,
  Flame,
  Clock,
  Users,
  Home,
  Medal,
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Target,
  RefreshCw,
  Bell,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { getPerfilDonante, getHistorialDonaciones, getMisionesActivas } from "@/services/donanteApi"
import { getMovimientosGlobales } from "@/services/api"
import { getSessionUser } from "@/lib/auth"
import { DonationModal } from "@/components/DonationModal"

/* ═══════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════ */

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let frame: number
    const dur = 1100
    const start = performance.now()
    const run = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setCount(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(run)
    }
    frame = requestAnimationFrame(run)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return <>{count.toLocaleString("es-MX")}</>
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const fallbackDescriptions: Record<string, string> = {
  "Alimentos":  "Garantiza la alimentación saludable de familias que necesitan estar cerca de sus hijos hospitalizados.",
  "Higiene":    "Artículos esenciales de cuidado personal para familias que salieron de casa inesperadamente.",
  "Médico":     "Medicamentos y suplementos que alivian el dolor y aceleran la recuperación.",
  "Cuidado":    "Materiales de apoyo y confort para abrigar a los niños durante las noches.",
  "Logística":  "Recursos operativos primordiales.",
  "Otros":      "Insumos de soporte al día a día.",
}

const itemImages: Record<string, string> = {
  "Fórmula Infantil L1":         "https://farmaciacoyoacan.com/cdn/shop/files/7501058623188_01.jpg?v=1723703269",
  "Fórmula Láctea Etapa 1":      "https://www.movil.farmaciasguadalajara.com/wcsstore/FGCAS/wcs/products/1246763_A_1280_AL.jpg",
  "Leche Entera 1L":             "https://cdn-bm.aktiosdigitalservices.com/tol/bm/media/product/img/700x700/A76411_00.jpg?t=20260128040006",
  "Pañales RN":                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQgl1JNhPgPCtQ90vWPrfUEk1icRNb1QYonA&s",
  "Pañales Etapa 3":             "https://www.costco.com.mx/medias/sys_master/products/h8a/h25/192116155940894.jpg",
  "Paracetamol Gotas":           "https://www.movil.farmaciasguadalajara.com/wcsstore/FGCAS/wcs/products/1420976_A_1280_AL.jpg",
}
const categoryImages: Record<string, string> = {
  "Alimentos":  "https://images.unsplash.com/photo-1639122654099-6e3017e70c21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Higiene":    "https://images.unsplash.com/photo-1584308666744-24d5e4a819b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Médico":     "https://images.unsplash.com/photo-1576089275776-b6cd5deabdad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Cuidado":    "https://images.unsplash.com/photo-1762922542177-689d5b007e61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Logística":  "https://images.unsplash.com/photo-1554498808-aaf30c4a22c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Otros":      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "default":    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
}

const sedes = [
  { key: "cdmx", label: "Casa CDMX" },
  { key: "puebla", label: "Casa Puebla" },
  { key: "edomex", label: "Casa Edo. de México" },
]

export default function DonorHomePage() {
  const [activeSede, setActiveSede] = useState("all")
  
  // Session user (client-only: avoids SSR hydration mismatch)
  const [sessionUser, setSessionUser] = useState<ReturnType<typeof getSessionUser>>(null)

  // Real Data states
  const [perfil, setPerfil] = useState<any>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [misiones, setMisiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Modal state
  const [modalAbierto, setModalAbierto] = useState(false)
  const [misionSeleccionada, setMisionSeleccionada] = useState<any>(null)

  // Populate session on client mount only
  useEffect(() => {
    setSessionUser(getSessionUser())
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const user = getSessionUser()
      if (!user) return

      // Cargar APIs concurrentes
      // NOTA: historial retorna null en fallo (no []) para no borrar el optimistic update
      const [perfilData, historialData, insumosRaw, movimientos] = await Promise.all([
        getPerfilDonante(user.usuario_id).catch(() => null),
        getHistorialDonaciones(user.usuario_id).catch(() => null),
        getMisionesActivas(),
        getMovimientosGlobales(100),
      ])

      if (perfilData) setPerfil(perfilData)
      // Solo pisar el historial si el backend devolvió datos reales
      if (historialData !== null) setHistorial(Array.isArray(historialData) ? historialData : [])

      const countMap: Record<string, number> = {}
      for (const mov of movimientos) {
        if (mov.tipo_movimiento === "entrada") {
          countMap[mov.insumo_id] = (countMap[mov.insumo_id] ?? 0) + 1
        }
      }

      const mapeados = (insumosRaw as any[]).map((mision) => {
        let urgency: "high" | "medium" | "low" = "low"
        if (mision.dias_para_agotarse <= 3) urgency = "high"
        else if (mision.dias_para_agotarse <= 7) urgency = "medium"

        const costoUnitario = 85
        const raised        = Math.round(mision.stock_actual * costoUnitario)
        const goalBruto     = Math.round(mision.capacidad_maxima * costoUnitario)
        const goal          = goalBruto > raised ? goalBruto : raised + Math.round(costoUnitario * 10)
        const percent       = Math.min(100, Math.round((raised / goal) * 100))

        const timeLeft      = mision.dias_para_agotarse === 0 
          ? "AGOTADO" 
          : mision.dias_para_agotarse < 1 
            ? "Horas restantes" 
            : `${Math.round(mision.dias_para_agotarse)} días`

        return {
          id:            mision.insumo_id,
          title:         mision.nombre_insumo,
          emotion:       mision.mensaje || (fallbackDescriptions[mision.categoria] ?? "Tu ayuda transforma la incertidumbre en esperanza."),
          image:         itemImages[mision.nombre_insumo] ?? categoryImages[mision.categoria] ?? categoryImages.default,
          raised,
          goal,
          percent,
          timeLeft,
          donors:        countMap[mision.insumo_id] ?? 0,
          beneficiaries: `Acción inmediata`,
          location:      mision.sede,
          urgency,
          raw:           mision,
        }
      })

      mapeados.sort((a, b) => {
        const ord = { high: 0, medium: 1, low: 2 }
        return ord[a.urgency as keyof typeof ord] - ord[b.urgency as keyof typeof ord]
      })

      setMisiones(mapeados)
    } catch (err) {
      console.error("Error cargando dashboard donante:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredMissions =
    activeSede === "all"
      ? misiones
      : misiones.filter((m) => m.location === activeSede)

  // Variables con fallback si están cargando o ausentes
  const userName = sessionUser?.nombre || "Héroe"
  const donorNivel = perfil?.nivel || "Nivel Base"
  const familiasImpactadasAuto = perfil?.familias_impactadas_acumuladas || 0
  const familiesInCare = familiasImpactadasAuto > 0 ? familiasImpactadasAuto : 12
  const totalMovimientos = perfil?.total_movimientos || 0
  const impactoAcumulado = perfil?.total_donado_mxn || 0

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden pb-10">
      {/* HERO CARD UNIFICADO — PREMIUM ELEVATION */}
      <FadeUp>
        <Card className="relative overflow-hidden border-none bg-[#0F172A] text-white shadow-2xl shadow-slate-900/20">
          {/* Capas de diseño abstracto */}
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[120%] bg-[#DA291C]/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] left-[10%] w-[30%] h-[100%] bg-[#FFBC0D]/10 rounded-full blur-[100px]" />
          
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay" />

          <CardContent className="relative p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#DA291C] to-[#FFBC0D] p-[2px] shadow-lg shadow-red-500/20">
                    <div className="h-full w-full rounded-[14px] bg-[#0F172A] flex items-center justify-center">
                       <Heart className="w-7 h-7 text-white fill-[#DA291C] animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight" suppressHydrationWarning>
                      {userName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest">
                        Donante Verificado
                      </Badge>
                      <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest">
                        Nivel {donorNivel}
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed mt-4">
                  Tu impacto hoy se traduce en bienestar directo para <strong>{familiasImpactadasAuto} familias</strong>. McCare CareForecast sugiere que tu apoyo es vital esta semana.
                </p>
                
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button className="bg-[#DA291C] hover:bg-[#b8221a] text-white px-6 py-6 rounded-2xl font-bold shadow-xl shadow-red-500/25 transition-all hover:scale-105 active:scale-95 group">
                    Donación de Emergencia
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <span className="text-white/90 text-[13px] font-semibold">
                      Impacto +12% este mes
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8 shrink-0 bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-inner">
                <div className="text-right">
                  <p className="text-4xl sm:text-5xl font-black tracking-tighter text-[#FFBC0D]">
                    {loading ? <span className="h-10 w-20 bg-white/10 rounded animate-pulse inline-block" /> : <CountUp target={familiasImpactadasAuto} />}
                  </p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Familias Ayudadas
                  </p>
                </div>
                <div className="w-px h-16 bg-white/10" />
                <div className="text-right">
                  <p className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
                    {loading ? <span className="h-10 w-32 bg-white/10 rounded animate-pulse inline-block" /> : <CountUp target={impactoAcumulado} />}
                  </p>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                    Inversión Social (MXN)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeUp>

      {/* ROW 2: 4 KPI CARDS — GLASSMORPHISM */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          { iconBg: "bg-red-500/10", icon: Shield, iconColor: "text-red-500", label: "Protección Infantil", value: familiesInCare, isCurrency: false, sub: "Familias", fallbackValue: 12 },
          { iconBg: "bg-blue-500/10", icon: Zap, iconColor: "text-blue-500", label: "Acciones Rápidas", value: totalMovimientos, isCurrency: false, sub: "Movimientos" },
          { iconBg: "bg-amber-500/10", icon: Sparkles, iconColor: "text-amber-500", label: "Puntos Recaudados", value: Math.round(impactoAcumulado / 10), isCurrency: false, sub: "Karma Points" },
          { iconBg: "bg-emerald-500/10", icon: FileText, iconColor: "text-emerald-500", label: "Estatus Fiscal", value: "DEDUCIBLE", sub: "3 Recibos nuevos", subColor: "text-emerald-500" },
        ].map((c, i) => (
          <FadeUp key={i} delay={0.05 + i * 0.05}>
            <Card className="group border-border/40 bg-white/80 hover:bg-white backdrop-blur-xl shadow-sm hover:shadow-xl transition-all duration-300 h-full py-1 cursor-default border-b-4 border-b-transparent hover:border-b-[#DA291C]/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                   <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", c.iconBg)}>
                    <c.icon className={cn("w-5 h-5", c.iconColor)} />
                  </div>
                  {c.subColor && <Badge className={cn("bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-bold")}>{c.sub}</Badge>}
                </div>
                <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">{c.label}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  {loading ? (
                    <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    <p className="text-slate-900 text-2xl font-black tracking-tight">
                      {typeof c.value === 'number' ? <CountUp target={c.value || (c.fallbackValue as number)} /> : c.value}
                    </p>
                  )}
                  {c.sub && !c.subColor && <span className="text-[10px] text-slate-400 font-medium">{c.sub}</span>}
                </div>
              </CardContent>
            </Card>
          </FadeUp>
        ))}
      </div>

      {/* ROW 3: Missions (Real Cards) + History */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-4 flex-1 min-h-0">
        <FadeUp delay={0.25} className="xl:col-span-6 min-h-0">
          <Card className="border-border/50 shadow-sm h-full flex flex-col py-0">
            <CardHeader className="pb-3 pt-4 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Misiones Críticas Activas</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">Prioridades detectadas por CareforecastIA</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchData} className="text-muted-foreground hover:text-[#DA291C] text-[10px] h-7">
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  Actualizar
                </Button>
              </div>

              <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
                <Button variant={activeSede === "all" ? "default" : "secondary"} size="sm" onClick={() => setActiveSede("all")} className={cn("h-7 text-[10px] font-semibold", activeSede === "all" && "bg-[#DA291C]")}>Todas</Button>
                {sedes.map((s) => (
                  <Button key={s.key} variant={activeSede === s.key ? "default" : "secondary"} size="sm" onClick={() => setActiveSede(s.key)} className={cn("h-7 text-[10px] font-semibold shrink-0", activeSede === s.key && "bg-[#DA291C]")}>{s.label}</Button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  Cargando misiones reales...
                </div>
              ) : filteredMissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMissions.map((mission) => (
                    <div key={mission.id} className="group bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-red-200 shadow-sm transition-all flex flex-col">
                      <div className="relative h-36 bg-slate-100">
                        <img src={mission.image} alt={mission.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        
                        {(mission.urgency === "high" || mission.urgency === "medium") && (
                          <div className="absolute top-2 left-2">
                            <Badge className={cn("text-[8px] px-1.5 py-0.5", mission.urgency === "high" ? "bg-red-600 text-white" : "bg-amber-500 text-white")}>
                              {mission.urgency === "high" ? "URGENCIA CRÍTICA" : "EN ATENCIÓN"}
                            </Badge>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/95 text-slate-800 px-2 py-0.5 rounded-full">
                          <Heart className="w-2.5 h-2.5 text-[#DA291C] fill-[#DA291C]" />
                          <span className="text-[9px] font-bold">{mission.beneficiaries}</span>
                        </div>
                      </div>
                      
                      <div className="p-3 flex flex-col flex-1">
                        <h3 className="text-slate-900 text-xs font-bold leading-tight line-clamp-1">{mission.title}</h3>
                        <div className="mt-2 text-[10px]">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold">${mission.raised.toLocaleString()} MXN</span>
                            <span className="text-slate-400">de ${mission.goal.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${mission.percent}%` }} />
                          </div>
                        </div>
                        <button onClick={() => { setMisionSeleccionada(mission); setModalAbierto(true); }} className="w-full mt-3 bg-[#DA291C] text-white py-1.5 text-[10px] rounded-md font-bold hover:bg-[#b8221a] flex items-center justify-center gap-1">
                          Aportar ahora <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">No hay misiones actualmente.</div>
              )}
            </CardContent>
          </Card>
        </FadeUp>

        {/* RIGHT: History */}
        <FadeUp delay={0.3} className="xl:col-span-4 min-h-0">
          <Card className="border-border/50 shadow-sm h-full flex flex-col py-0">
            <CardHeader className="pb-3 pt-4 shrink-0 border-b">
              <CardTitle className="text-base">Historial Reciente</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              {loading ? (
                <div className="flex flex-col gap-3 p-4">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex gap-2 p-2 items-center bg-slate-50/50 rounded-lg animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 bg-slate-200 rounded" />
                        <div className="h-2 w-1/4 bg-slate-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : historial.length > 0 ? (
                <Table>
                  <TableBody>
                    {historial.map((row: any, i) => (
                      <TableRow key={row.id || i}>
                        <TableCell className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded flex items-center justify-center bg-emerald-50 text-emerald-500">
                              <Heart className="w-3 h-3" />
                            </div>
                            <div>
                              <p className="text-xs font-bold">{row.observacion || row.tipo || "Aportación"}</p>
                              <p className="text-[9px] text-muted-foreground">
                                {new Date(row.fecha).toLocaleDateString("es-MX", { day: '2-digit', month: 'short', year: 'numeric'})}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold py-2.5">
                          ${typeof row.monto_mxn === 'number' ? row.monto_mxn.toLocaleString("es-MX", { minimumFractionDigits: 2}) : (row.monto_mxn ?? row.monto ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2})}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center text-sm">
                  <Shield className="w-10 h-10 text-slate-200 mb-2" />
                  <p>Aún no hay contribuciones en tu historial.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeUp>
      </div>
      
      <DonationModal
        open={modalAbierto}
        onOpenChange={(open) => {
          setModalAbierto(open)
          if (!open) {
            setMisionSeleccionada(null) // Limpiar para evitar re-render con datos viejos
            fetchData()
          }
        }}
        mission={misionSeleccionada}
        onDonationSuccess={(donacion) => {
          // Optimistic update: agrega la donación al historial local de inmediato
          setHistorial((prev) => [{ ...donacion, id: `local-${Date.now()}` }, ...prev])
        }}
      />
    </div>
  )
}
