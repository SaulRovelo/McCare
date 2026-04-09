"use client"

import { useEffect, useState, useCallback } from "react"
import { Heart, Clock, Target, Users, Zap, ArrowRight, Flame, RefreshCw } from "lucide-react"
import { DonationModal } from "@/components/DonationModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInsumos, getMovimientosGlobales } from "@/services/api"

// ── Descripciones emocionales por categoría ─────────────────────────────────
const fallbackDescriptions: Record<string, string> = {
  "Alimentos":  "Garantiza la alimentación saludable de familias que necesitan estar cerca de sus hijos hospitalizados. Cada comida significa un día más de nutrición y esperanza.",
  "Higiene":    "Artículos esenciales de cuidado personal para familias que salieron de casa inesperadamente y necesitan mantenerse fuertes.",
  "Médico":     "Suministros de primeros auxilios e insumos clínicos básicos para familias con necesidades de salud inmediatas.",
  "Cuidado":    "Materiales de apoyo, confort y cuidado para abrigar a los niños y sus familias durante las noches más largas.",
  "Logística":  "Recursos operativos que mantienen funcionando la casa y permiten que todo llegue a tiempo a quienes más lo necesitan.",
  "Otros":      "Insumos de soporte que complementan la operación diaria y garantizan la dignidad de cada familia alojada.",
}

// ── Imágenes por categoría (Unsplash, sin key requerida) ─────────────────────
const categoryImages: Record<string, string> = {
  "Alimentos":  "https://images.unsplash.com/photo-1639122654099-6e3017e70c21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Higiene":    "https://images.unsplash.com/photo-1584308666744-24d5e4a819b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Médico":     "https://images.unsplash.com/photo-1576089275776-b6cd5deabdad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Cuidado":    "https://images.unsplash.com/photo-1762922542177-689d5b007e61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Logística":  "https://images.unsplash.com/photo-1554498808-aaf30c4a22c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "Otros":      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  "default":    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
}

// ── Imágenes personalizadas por nombre exacto de Misión (Insumo) ─────────────
const itemImages: Record<string, string> = {
  "Fórmula Infantil L1":         "https://farmaciacoyoacan.com/cdn/shop/files/7501058623188_01.jpg?v=1723703269",
  "Fórmula Láctea Etapa 1":      "https://www.movil.farmaciasguadalajara.com/wcsstore/FGCAS/wcs/products/1246763_A_1280_AL.jpg",
  "Leche Entera 1L":             "https://cdn-bm.aktiosdigitalservices.com/tol/bm/media/product/img/700x700/A76411_00.jpg?t=20260128040006",
  "Papilla de Frutas":           "https://www.recetasparamibebe.com/wp-content/uploads/2023/11/Receta-papilla-frutas-yogur-galletas.jpg",
  "Pañales RN":                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQgl1JNhPgPCtQ90vWPrfUEk1icRNb1QYonA&s",
  "Pañales Etapa 3":             "https://www.costco.com.mx/medias/sys_master/products/h8a/h25/192116155940894.jpg",
  "Pañales Etapa 4":             "https://hebmx.vtexassets.com/arquivos/ids/649849-800-800?v=638823916793600000&width=800&height=800&aspect=true",
  "Suero Oral (Pediátrico)":     "https://farmacia-frias.com/37623-home_default/bi-oralsuero-sabor-fresa-2-x-330-ml.jpg",
  "Suero Oral":                  "https://www.ministeriodesalud.go.cr/images/imagenesms/2022/Prensa/img_electrolit.png",
  "Paracetamol Gotas":           "https://www.movil.farmaciasguadalajara.com/wcsstore/FGCAS/wcs/products/1420976_A_1280_AL.jpg",
  "Jabón Neutro":                "https://surtace.mayoreoenlinea.mx/cdn/shop/products/1_1.jpg?v=1700064595",
  "Toallas Húmedas Pqte":        "https://i5.walmartimages.com.mx/gr/images/product-images/img_large/00750611068452L1.jpg?odnHeight=612&odnWidth=612&odnBg=FFFFFF",
  "Toallas Húmedas (Paquete)":   "https://arteli.vtexassets.com/arquivos/ids/268053-800-auto?v=638853479232670000&width=800&height=auto&aspect=true",
  "Papillas Surtidas":           "https://tb-static.uber.com/prod/image-proc/processed_images/487a91487f5305a689182267df2a0041/b4665c191b34baf3d0e0fa45dfdd3d1d.jpeg",
  "Biberones 8oz":               "https://i5-mx.walmartimages.com/gr/images/product-images/img_large/00750102751360L.jpg",
  "Sillas de Ruedas Pediátricas":"https://medwalk.mx/wp-content/uploads/2023/05/SILLA-INFANTIL-SP3602E.png",
  "Juguetes Didácticos":         "https://http2.mlstatic.com/D_NQ_NP_992637-MLA99945687957_112025-O.webp",
  "Nutrición Parenteral Esp":    "https://bexen.com/wp-content/uploads/Comparativa-dispositivos-nutricion-enteral.webp",
  "Nutrición Parenteral Esp.":   "https://bexen.com/wp-content/uploads/Comparativa-dispositivos-nutricion-enteral.webp",
  "Apoyo de Transporte (Boletos)":"https://printpv.com/web/image/product.image/106/image_1024/Boletos?unique=c6f652c",
  "Despensas Comunitarias":       "https://www.caritas.org.mx/wp-content/uploads/2020/07/que-lleva-una-despensa-basica.jpg",
  "Kits de Aseo Personal":        "https://detqhtv6m6lzl.cloudfront.net/HCLContenido/producto/FullImage/7502263760347-01.jpg",
  "Cobijas Térmicas":             "https://m.media-amazon.com/images/I/91l8auHSvpL.jpg",
  "Snacks Nutricionales":         "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2sB8qiRmg5ZrO92-Sg-9PDpkuuM_oyR1Rlg&s",
  "Gasa Estéril":                 "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOsodKJv_jlLHqUrmnG1nE6Nltr0WGYrbV-w&s",
  "Kit Pediátrico Respiratorio":  "https://http2.mlstatic.com/D_NQ_NP_904065-MLM92253960516_092025-O.webp",
  "Colchonetas Extra":            "https://resources.sears.com.mx/medios-plazavip/t1/1719343475BETADREAMSjpg?scale=500&qlty=75"
}

const SEDES = [
  { id: "cdmx",   name: "Casa CDMX" },
  { id: "puebla", name: "Casa Puebla" },
  { id: "edomex", name: "Casa Estado de México" },
]

// ── Componente ───────────────────────────────────────────────────────────────

export function MissionsGrid() {
  const [misiones, setMisiones]                 = useState<any[]>([])
  const [misionSeleccionada, setMisionSeleccionada] = useState<any | null>(null)
  const [modalAbierto, setModalAbierto]         = useState(false)
  const [loading, setLoading]                   = useState(true)
  // Conteo de movimientos reales por insumo para el "donadores"
  const [movCountMap, setMovCountMap]           = useState<Record<string, number>>({})

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [insumosRaw, movimientos] = await Promise.all([
        getInsumos(),
        getMovimientosGlobales(100),
      ])

      // Construir mapa de conteo de entradas por insumo (representan "donadores")
      const countMap: Record<string, number> = {}
      for (const mov of movimientos) {
        if (mov.tipo_movimiento === "entrada") {
          countMap[mov.insumo_id] = (countMap[mov.insumo_id] ?? 0) + 1
        }
      }
      setMovCountMap(countMap)

      const mapeados = (insumosRaw as any[]).map((ins) => {
        // ── Financiamiento en MXN reales ──
        const costoUnitario = ins.costo_unitario > 0 ? ins.costo_unitario : 85
        const raised        = Math.round(ins.stock_actual * costoUnitario)
        const goalBruto     = Math.round(ins.capacidad_maxima * costoUnitario)
        const goal          = goalBruto > raised ? goalBruto : raised + Math.round(costoUnitario * 10)
        const percent       = Math.min(100, Math.round((raised / goal) * 100))

        // ── Tiempo restante real ──
        const consumoDiario    = ins.consumo_diario > 0 ? ins.consumo_diario : 1
        const horasRestantes   = Math.max(1, Math.round((ins.stock_actual / consumoDiario) * 24))
        const diasRestantes    = horasRestantes / 24
        
        const timeLeft         = horasRestantes > 48
          ? `${Math.round(horasRestantes / 24)} días`
          : `${horasRestantes} horas`
          
        // ── Urgencia real sincronizada a 3-7 ──
        let urgency: "high" | "medium" | "low" = "low"
        if (diasRestantes <= 3 || ins.stock_actual <= ins.nivel_critico) urgency = "high"
        else if (diasRestantes <= 7) urgency = "medium"
        else urgency = "low"

        // ── Beneficiarios (3 uds/familia/semana) ──
        const familiasImpacto  = Math.max(1, Math.floor((consumoDiario * 7) / 3))

        return {
          id:            ins.id,
          title:         ins.nombre,
          emotion:       fallbackDescriptions[ins.categoria] ?? "Tu ayuda transforma la incertidumbre en esperanza para nuestras familias.",
          image:         itemImages[ins.nombre] ?? categoryImages[ins.categoria] ?? categoryImages.default,
          raised,
          goal,
          percent,
          timeLeft,
          donors:        countMap[ins.id] ?? 0,       // movimientos de entrada reales
          beneficiaries: `${familiasImpacto} familia${familiasImpacto !== 1 ? "s" : ""}`,
          location:      ins.sede,
          urgency,
          raw: ins,                                   // dato bruto para el modal
        }
      })

      // Ordenar: críticos primero
      mapeados.sort((a, b) => {
        const ord = { high: 0, medium: 1, low: 2 }
        return ord[a.urgency as keyof typeof ord] - ord[b.urgency as keyof typeof ord]
      })

      // NUEVO: Ocultar misiones que superan los 7 días.
      // Así se alinea con la lógica de "mostrar de 0 a 7 exclusivamente".
      const filtrados = mapeados.filter(m => {
        if (m.timeLeft.includes('horas')) return true
        const dias = parseInt(m.timeLeft.split(' ')[0], 10)
        return !isNaN(dias) && dias <= 7
      })

      setMisiones(filtrados)
    } catch (err) {
      console.error("Error cargando misiones:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Refrescar tras cerrar el modal (la donación pudo cambiar el stock)
  const handleModalClose = (open: boolean) => {
    setModalAbierto(open)
    if (!open) fetchData()
  }

  const totalUrgentes = misiones.filter(m => m.urgency === "high").length

  return (
    <section id="misiones" className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-200 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-700" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
              {loading ? "Consultando inventario en tiempo real..." : `${totalUrgentes} misión${totalUrgentes !== 1 ? "es" : ""} urgente${totalUrgentes !== 1 ? "s" : ""} detectada${totalUrgentes !== 1 ? "s" : ""} por IA`}
            </span>
          </div>

          <h2 className="text-slate-900" style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Misiones Críticas Activas
          </h2>
          <p className="text-slate-500 mt-4 mx-auto" style={{ fontSize: "1.125rem", lineHeight: 1.7, maxWidth: "38rem" }}>
            Estos niños y familias necesitan tu ayuda urgente. Nuestro sistema asigna los recursos en tiempo real. Elige una misión y cambia una vida hoy.
          </p>

          <button
            onClick={fetchData}
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-600 border border-slate-200 bg-white rounded-xl hover:border-slate-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Actualizando..." : "Actualizar datos"}
          </button>
        </div>

        {/* ── Tabs por Sede ──  */}
        <Tabs defaultValue="cdmx" className="mt-8">
          <div className="flex justify-center mb-10">
            <TabsList className="grid w-full max-w-lg grid-cols-3 bg-white border border-slate-200 shadow-sm p-1 rounded-xl">
              {SEDES.map((sede) => (
                <TabsTrigger
                  key={sede.id}
                  value={sede.id}
                  className="rounded-lg data-[state=active]:bg-[#DA291C] data-[state=active]:text-white text-xs sm:text-sm"
                >
                  {sede.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {SEDES.map((sede) => {
            const misionesEnSede = misiones.filter(m => m.location === sede.id)
            return (
              <TabsContent key={sede.id} value={sede.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">

                  {/* Estado de carga */}
                  {loading && (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-pulse">
                        <div className="h-56 bg-slate-200" />
                        <div className="p-6 space-y-3">
                          <div className="h-5 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-100 rounded w-full" />
                          <div className="h-3 bg-slate-100 rounded w-5/6" />
                        </div>
                      </div>
                    ))
                  )}

                  {/* Misiones reales */}
                  {!loading && misionesEnSede.map((mission) => (
                    <div
                      key={mission.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-red-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Imagen */}
                      <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-100">
                        <img
                          src={mission.image}
                          alt={mission.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        {/* Badge de urgencia */}
                        {mission.urgency === "high" && (
                          <div className="absolute top-4 left-4">
                            <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-600/30">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                              </span>
                              <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                                URGENCIA CRÍTICA
                              </span>
                            </div>
                          </div>
                        )}
                        {mission.urgency === "medium" && (
                          <div className="absolute top-4 left-4">
                            <div className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30">
                              <span style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                                EN ATENCIÓN
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Beneficiarios */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                          <Heart className="w-3.5 h-3.5 text-[#DA291C] fill-[#DA291C]" />
                          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{mission.beneficiaries}</span>
                        </div>

                        {/* Tiempo */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-full shadow-sm">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{mission.timeLeft}</span>
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 p-6 flex flex-col">
                        <h3 className="text-slate-900" style={{ fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 }}>
                          {mission.title}
                        </h3>
                        <p className="text-slate-500 mt-2 flex-1" style={{ fontSize: "0.9375rem", lineHeight: 1.65 }}>
                          {mission.emotion}
                        </p>

                        {/* Barra de progreso en MXN */}
                        <div className="mt-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-900" style={{ fontSize: "0.9375rem", fontWeight: 700 }}>
                              ${mission.raised.toLocaleString()} <span className="text-slate-400" style={{ fontWeight: 400, fontSize: "0.8125rem" }}>MXN</span>
                            </span>
                            <span className="text-slate-400" style={{ fontSize: "0.8125rem" }}>
                              de ${mission.goal.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-red-500 to-red-600"
                              style={{ width: `${mission.percent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-red-600" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                              {mission.percent}% financiado
                            </span>
                            <div className="flex items-center gap-1 text-slate-400">
                              <Users className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.75rem" }}>
                                {mission.donors > 0 ? `${mission.donors} donaciones` : "Sé el primero"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Métricas de urgencia */}
                        <div className="flex items-center gap-3 mt-5 p-3 bg-red-50/60 border border-red-100 rounded-xl">
                          <div className="flex-1 text-center">
                            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
                              <Target className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.6875rem", fontWeight: 500 }}>Meta</span>
                            </div>
                            <span className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                              ${mission.goal.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-px h-8 bg-red-200" />
                          <div className="flex-1 text-center">
                            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.6875rem", fontWeight: 500 }}>Restante</span>
                            </div>
                            <span className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                              {mission.timeLeft}
                            </span>
                          </div>
                          <div className="w-px h-8 bg-red-200" />
                          <div className="flex-1 text-center">
                            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
                              <Zap className="w-3.5 h-3.5" />
                              <span style={{ fontSize: "0.6875rem", fontWeight: 500 }}>Falta</span>
                            </div>
                            <span className="text-slate-900" style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                              ${(mission.goal - mission.raised).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => { setMisionSeleccionada(mission); setModalAbierto(true) }}
                          className="w-full mt-5 bg-[#DA291C] hover:bg-[#b8221a] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
                          style={{ fontSize: "0.9375rem", fontWeight: 600 }}
                        >
                          <Heart className="w-4 h-4" />
                          Aportar a esta misión
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {!loading && misionesEnSede.length === 0 && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                      <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="font-medium">No hay misiones activas en la {sede.name}</p>
                      <p className="text-sm mt-1">El inventario está en niveles seguros o aún se está cargando.</p>
                    </div>
                  )}

                </div>
              </TabsContent>
            )
          })}
        </Tabs>

        {/* ── Bottom CTA ── */}
        <div className="text-center mt-16 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
          <p className="text-slate-600 mb-4" style={{ fontSize: "1rem" }}>
            ¿Tienes una empresa o quieres cubrir una misión completa? Las organizaciones pueden patrocinar necesidades enteras y obtener beneficios ESG.
          </p>
          <a
            href="/corporativo"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer shadow-md shadow-slate-900/20"
            style={{ fontSize: "0.9375rem", fontWeight: 500 }}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            Quiero ser Socio Corporativo
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>

      <DonationModal
        open={modalAbierto}
        onOpenChange={handleModalClose}
        mission={misionSeleccionada}
      />
    </section>
  )
}